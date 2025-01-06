import { Component, inject, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IMindmapXml } from '../mindmap-xml.model';
import { MindmapXmlService } from '../service/mindmap-xml.service';
import { MindmapXmlFormService, MindmapXmlFormGroup } from './mindmap-xml-form.service';

@Component({
  standalone: true,
  selector: 'jhi-mindmap-xml-update',
  templateUrl: './mindmap-xml-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class MindmapXmlUpdateComponent implements OnInit {
  isSaving = false;
  mindmapXml: IMindmapXml | null = null;

  protected mindmapXmlService = inject(MindmapXmlService);
  protected mindmapXmlFormService = inject(MindmapXmlFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: MindmapXmlFormGroup = this.mindmapXmlFormService.createMindmapXmlFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ mindmapXml }) => {
      this.mindmapXml = mindmapXml;
      if (mindmapXml) {
        this.updateForm(mindmapXml);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const mindmapXml = this.mindmapXmlFormService.getMindmapXml(this.editForm);
    if (mindmapXml.id !== null) {
      this.subscribeToSaveResponse(this.mindmapXmlService.update(mindmapXml));
    } else {
      this.subscribeToSaveResponse(this.mindmapXmlService.create(mindmapXml));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMindmapXml>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(mindmapXml: IMindmapXml): void {
    this.mindmapXml = mindmapXml;
    this.mindmapXmlFormService.resetForm(this.editForm, mindmapXml);
  }
}
