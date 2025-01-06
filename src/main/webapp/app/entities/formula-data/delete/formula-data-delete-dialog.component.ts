import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IFormulaData } from '../formula-data.model';
import { FormulaDataService } from '../service/formula-data.service';

@Component({
  standalone: true,
  templateUrl: './formula-data-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class FormulaDataDeleteDialogComponent {
  formulaData?: IFormulaData;

  protected formulaDataService = inject(FormulaDataService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.formulaDataService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
