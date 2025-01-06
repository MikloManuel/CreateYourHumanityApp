import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IFriends } from '../friends.model';
import { FriendsService } from '../service/friends.service';

@Component({
  standalone: true,
  templateUrl: './friends-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class FriendsDeleteDialogComponent {
  friends?: IFriends;

  protected friendsService = inject(FriendsService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.friendsService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
