import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe } from 'app/shared/date';
import { IFormulaData } from '../formula-data.model';

@Component({
  standalone: true,
  selector: 'jhi-formula-data-detail',
  templateUrl: './formula-data-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class FormulaDataDetailComponent {
  formulaData = input<IFormulaData | null>(null);

  previousState(): void {
    window.history.back();
  }
}
