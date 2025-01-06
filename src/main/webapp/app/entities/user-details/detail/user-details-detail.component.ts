import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe } from 'app/shared/date';
import { IUserDetails } from '../user-details.model';

@Component({
  standalone: true,
  selector: 'jhi-user-details-detail',
  templateUrl: './user-details-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class UserDetailsDetailComponent {
  userDetails = input<IUserDetails | null>(null);

  previousState(): void {
    window.history.back();
  }
}
