import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe } from 'app/shared/date';
import { IKeyTable } from '../key-table.model';

@Component({
  standalone: true,
  selector: 'jhi-key-table-detail',
  templateUrl: './key-table-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class KeyTableDetailComponent {
  keyTable = input<IKeyTable | null>(null);

  previousState(): void {
    window.history.back();
  }
}
