import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe } from 'app/shared/date';
import { IUserMindmap } from '../user-mindmap.model';

@Component({
  standalone: true,
  selector: 'jhi-user-mindmap-detail',
  templateUrl: './user-mindmap-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class UserMindmapDetailComponent {
  userMindmap = input<IUserMindmap | null>(null);

  previousState(): void {
    window.history.back();
  }
}
