import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe } from 'app/shared/date';
import { IFriends } from '../friends.model';

@Component({
  standalone: true,
  selector: 'jhi-friends-detail',
  templateUrl: './friends-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class FriendsDetailComponent {
  friends = input<IFriends | null>(null);

  previousState(): void {
    window.history.back();
  }
}
