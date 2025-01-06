import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IFriendrequest } from '../friendrequest.model';
import { FriendrequestService } from '../service/friendrequest.service';

@Component({
  standalone: true,
  templateUrl: './friendrequest-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class FriendrequestDeleteDialogComponent {
  friendrequest?: IFriendrequest;

  protected friendrequestService = inject(FriendrequestService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.friendrequestService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
