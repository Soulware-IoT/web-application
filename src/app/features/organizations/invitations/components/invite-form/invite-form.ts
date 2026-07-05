import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { InvitationService } from '../../../../../core/services/invitation.service';

/** Email input + submit that sends a new invitation for the active org. */
@Component({
  selector: 'app-invite-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslocoPipe],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="submit()"
      class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div class="grid gap-1">
        <label for="invite-email" class="sr-only">
          {{ 'organizations.invitations.email' | transloco }}
        </label>
        <input
          id="invite-email"
          type="email"
          formControlName="email"
          autocomplete="off"
          [attr.aria-invalid]="showError()"
          [attr.aria-describedby]="showError() ? 'invite-email-error' : null"
          [placeholder]="'organizations.invitations.email_placeholder' | transloco"
          class="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#0E3B63]"
          style="border-color: #e2e8f0; color: #1a1a1a"
        />
        @if (showError()) {
          <p id="invite-email-error" class="text-xs" style="color: #dc2626">
            {{ 'common.email_invalid' | transloco }}
          </p>
        }
      </div>
      <button
        type="submit"
        [disabled]="sending()"
        class="h-fit self-start rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        style="background: #0E3B63"
      >
        {{
          (sending()
            ? 'organizations.invitations.sending'
            : 'organizations.invitations.send'
          ) | transloco
        }}
      </button>
    </form>
  `,
})
export class InviteForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly invitations = inject(InvitationService);

  protected readonly sending = this.invitations.sending;

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected showError(): boolean {
    const control = this.form.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.sending()) {
      this.form.markAllAsTouched();
      return;
    }
    const ok = await this.invitations.invite(this.form.getRawValue().email.trim());
    if (ok) this.form.reset();
  }
}
