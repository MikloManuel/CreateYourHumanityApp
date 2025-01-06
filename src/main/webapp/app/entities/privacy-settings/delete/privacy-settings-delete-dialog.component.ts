import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPrivacySettings } from '../privacy-settings.model';
import { PrivacySettingsService } from '../service/privacy-settings.service';

@Component({
  standalone: true,
  templateUrl: './privacy-settings-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PrivacySettingsDeleteDialogComponent {
  privacySettings?: IPrivacySettings;

  protected privacySettingsService = inject(PrivacySettingsService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.privacySettingsService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
