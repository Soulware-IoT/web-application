import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SidenavBrand } from '../sidenav-brand/sidenav-brand';
import { SidenavNav } from '../sidenav-nav/sidenav-nav';
import { SidenavUser } from '../sidenav-user/sidenav-user';

@Component({
  selector: 'app-sidenav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SidenavBrand, SidenavNav, SidenavUser],
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
