import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IGrantSettings } from '../grant-settings.model';
import { GrantSettingsService } from '../service/grant-settings.service';

@Component({
  standalone: true,
  templateUrl: './grant-settings-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class GrantSettingsDeleteDialogComponent {
  grantSettings?: IGrantSettings;

  protected grantSettingsService = inject(GrantSettingsService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.grantSettingsService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
