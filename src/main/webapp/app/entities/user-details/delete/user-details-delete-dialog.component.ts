import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IUserDetails } from '../user-details.model';
import { UserDetailsService } from '../service/user-details.service';

@Component({
  standalone: true,
  templateUrl: './user-details-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class UserDetailsDeleteDialogComponent {
  userDetails?: IUserDetails;

  protected userDetailsService = inject(UserDetailsService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.userDetailsService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
