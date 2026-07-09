import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserProfile } from './components/user-profile/user-profile';
import { SignOutButton } from './components/sign-out-button/sign-out-button';
import { LanguageSwitcher } from './components/language-switcher/language-switcher';

@Component({
  selector: 'app-sidenav-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserProfile, LanguageSwitcher, SignOutButton],
  templateUrl: './sidenav-bottom.html',
})
export class SidenavBottom {}
