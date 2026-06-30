import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserProfile } from './components/user-profile/user-profile';
import { SignOutButton } from './components/sign-out-button/sign-out-button';

@Component({
  selector: 'app-sidenav-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserProfile, SignOutButton],
  templateUrl: './sidenav-user.html',
})
export class SidenavUser {}
