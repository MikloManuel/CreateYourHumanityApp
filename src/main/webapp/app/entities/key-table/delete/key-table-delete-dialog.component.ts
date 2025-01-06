import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IKeyTable } from '../key-table.model';
import { KeyTableService } from '../service/key-table.service';

@Component({
  standalone: true,
  templateUrl: './key-table-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class KeyTableDeleteDialogComponent {
  keyTable?: IKeyTable;

  protected keyTableService = inject(KeyTableService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.keyTableService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
