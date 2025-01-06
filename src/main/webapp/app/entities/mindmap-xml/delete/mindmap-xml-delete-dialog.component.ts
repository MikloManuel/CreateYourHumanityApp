import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IMindmapXml } from '../mindmap-xml.model';
import { MindmapXmlService } from '../service/mindmap-xml.service';

@Component({
  standalone: true,
  templateUrl: './mindmap-xml-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class MindmapXmlDeleteDialogComponent {
  mindmapXml?: IMindmapXml;

  protected mindmapXmlService = inject(MindmapXmlService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.mindmapXmlService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
