import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe } from 'app/shared/date';
import { IMindmapXml } from '../mindmap-xml.model';

@Component({
  standalone: true,
  selector: 'jhi-mindmap-xml-detail',
  templateUrl: './mindmap-xml-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class MindmapXmlDetailComponent {
  mindmapXml = input<IMindmapXml | null>(null);

  previousState(): void {
    window.history.back();
  }
}
