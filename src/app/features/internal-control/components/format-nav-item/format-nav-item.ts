import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ControlFormatResponse, STATUS_COLOR } from '../../../../core/models/control-format.model';

@Component({
  selector: 'app-format-nav-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './format-nav-item.html',
})
export class FormatNavItem {
  readonly format = input.required<ControlFormatResponse>();

  protected readonly statusColor = computed(() => STATUS_COLOR[this.format().status]);
}
