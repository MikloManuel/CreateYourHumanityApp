import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IUserMindmap } from '../user-mindmap.model';
import { UserMindmapService } from '../service/user-mindmap.service';

@Component({
  standalone: true,
  templateUrl: './user-mindmap-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class UserMindmapDeleteDialogComponent {
  userMindmap?: IUserMindmap;

  protected userMindmapService = inject(UserMindmapService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.userMindmapService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
