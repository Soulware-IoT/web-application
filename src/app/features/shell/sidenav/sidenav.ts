import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter } from 'rxjs';
import { SidenavBrand } from './components/sidenav-brand/sidenav-brand';
import { SidenavNav } from './components/sidenav-nav/sidenav-nav';
import { SidenavBottom } from './components/sidenav-bottom/sidenav-bottom';
import { SidenavOrgSelector } from './components/sidenav-org-selector/sidenav-org-selector';
import { NotificationBell } from './components/notification-bell/notification-bell';

@Component({
  selector: 'app-sidenav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SidenavBrand,
    SidenavNav,
    SidenavBottom,
    SidenavOrgSelector,
    NotificationBell,
    TranslocoPipe,
  ],
  templateUrl: './sidenav.html',
})
export class Sidenav implements OnInit {
  private readonly router = inject(Router);
  protected readonly isOpen = signal(false);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.isOpen.set(false));
  }

  protected toggle(): void {
    this.isOpen.update((v) => !v);
  }
}
