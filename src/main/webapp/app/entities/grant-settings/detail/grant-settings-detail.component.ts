import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe } from 'app/shared/date';
import { IGrantSettings } from '../grant-settings.model';

@Component({
  standalone: true,
  selector: 'jhi-grant-settings-detail',
  templateUrl: './grant-settings-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class GrantSettingsDetailComponent {
  grantSettings = input<IGrantSettings | null>(null);

  previousState(): void {
    window.history.back();
  }
}
