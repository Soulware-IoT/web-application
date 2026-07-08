# Matriz de permisos — pidemas

Authz a implementar en el **backend Spring Boot** (Fase 3). El gateway ya es puro forwarder; la fuente de verdad es la DB, no el JWT claim `organizations`.

## Niveles de rol (de menor a mayor)

```
NONE (== ASSIGNEE base) < ASSIGNEE < LIEUTENANT < ADMIN
```

> "Admin del contexto" ≠ "admin global". El rol ADMIN puede ser de organización o de un contexto específico (security, internal-control).

---

## Contexto: profiles

| Acción | Mínimo requerido |
|---|---|
| Cualquier operación | Autenticado (JWT válido) |

Sin lógica de rol. Cualquier usuario logueado puede acceder a su propio perfil.

---

## Contexto: organization

| Acción | Endpoint | Mínimo requerido |
|---|---|---|
| Ver org, listar miembros, listar invitaciones | GET | Cualquier **miembro** de la org (NONE / ASSIGNEE) |
| Actualizar permiso de miembro a ASSIGNEE o NONE | PUT memberPermissions | **LIEUTENANT** (solo puede poner niveles ≤ propio: ASSIGNEE/NONE) |
| Actualizar permiso de miembro a LIEUTENANT o ADMIN | PUT memberPermissions | **ADMIN de organización** |
| Invitar usuario | POST invitations | **ADMIN de organización** |
| Remover miembro | DELETE member | **ADMIN de organización** |
| Renombrar organización | PATCH org | **ADMIN de organización** |
| Eliminar organización | DELETE org | **ADMIN de organización** |

---

## Contexto: security (dispositivos IoT)

> ⚠️ Los endpoints `/edge/**` e `/internal/**` usan `X-Edge-Api-Key`, NO JWT — deben quedar **excluidos** del filtro JWT en Spring.

| Acción | Endpoint | Mínimo requerido |
|---|---|---|
| Ver lista de dispositivos | GET devices | **ASSIGNEE** (NONE → no ve nada / oculto) |
| Ver detalle de dispositivo | GET device/:id | **ASSIGNEE** |
| Editar config (name, thresholds) | PATCH device | **LIEUTENANT** |
| Reclamar dispositivo | POST claim | **LIEUTENANT** |

---

## Contexto: internal-control (control de procesos)

| Acción | Endpoint | Mínimo requerido |
|---|---|---|
| Listar procesos | GET processes | **ASSIGNEE** |
| Ver proceso | GET process/:id | **ASSIGNEE** |
| Listar formats de un proceso | GET formats | **ASSIGNEE** |
| Ver format | GET format/:id | **ASSIGNEE** |
| Enviar un registro | POST registry | **ASSIGNEE** |
| Consultar datos de registries (lista) | GET registries | **LIEUTENANT** |
| Consultar registro individual | GET registry/:id | **LIEUTENANT** |
| Crear / editar proceso | POST/PUT process | **ADMIN del contexto** (no admin global) |
| Crear / editar format | POST/PUT format | **ADMIN del contexto** |
| Gestionar fields de un format | POST/PUT/DELETE field | **ADMIN del contexto** |
| Ciclo de vida del format (activate/suspend/resume/cease) | PATCH format/status | **ADMIN del contexto** |

---

## Resumen visual

```
                    NONE    ASSIGNEE   LIEUTENANT   ADMIN
profiles             ✅        ✅          ✅          ✅
org - leer           ✅        ✅          ✅          ✅
org - put perm ≤own  ❌        ❌          ✅          ✅
org - put perm ADMIN ❌        ❌          ❌          ✅
org - invitar/borrar ❌        ❌          ❌          ✅
security - ver       ❌        ✅          ✅          ✅
security - editar    ❌        ❌          ✅          ✅
ic - leer qué existe ❌        ✅          ✅          ✅
ic - enviar registry ❌        ✅          ✅          ✅
ic - leer datos reg  ❌        ❌          ✅          ✅
ic - admin procesos  ❌        ❌          ❌          ✅*
```

`*` Admin **del contexto**, no necesariamente admin global.

---

## Propiedad anti-staleness

La authz se lee de la DB **en cada request** — no del claim `organizations` del JWT. Cambiar el permiso de un usuario en la DB debe surtir efecto **inmediatamente**, sin que el usuario refresque su token.

---

## Pruebas de validación (Fase 3)

| Contexto | Acción | Rol del tester | Esperado |
|---|---|---|---|
| security | listar devices | assignee | 200 |
| security | PATCH thresholds | assignee | **403** |
| security | PATCH thresholds | lieutenant | 200 |
| internal-control | listar procesos | assignee | 200 |
| internal-control | crear proceso | assignee | **403** |
| internal-control | crear proceso | admin-de-contexto | 200 |
| internal-control | enviar registry | assignee | 200/201 |
| internal-control | leer registries | assignee | **403** |
| internal-control | leer registries | lieutenant | 200 |
| organization | ver org | miembro NONE | 200 |
| organization | poner permiso ASSIGNEE | lieutenant | 200 |
| organization | poner permiso ADMIN | lieutenant | **403** |

**Prueba no-staleness:** cambia el permiso de un usuario en la DB y, sin que refresque el token, repite la acción afectada → el resultado cambia de inmediato.
