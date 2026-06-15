import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './password-field.html',
})
export class PasswordField {
  /** Control del FormGroup padre. Se enlaza con [formControl]. */
  readonly control = input.required<FormControl<string>>();
  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  readonly autocomplete = input('current-password');
  readonly errorText = input('La contraseña es obligatoria.');

  protected readonly visible = signal(false);

  protected toggle(): void {
    this.visible.update((v) => !v);
  }
}
