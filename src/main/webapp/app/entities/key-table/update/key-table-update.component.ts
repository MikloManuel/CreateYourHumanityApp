import { Component, inject, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IKeyTable } from '../key-table.model';
import { KeyTableService } from '../service/key-table.service';
import { KeyTableFormService, KeyTableFormGroup } from './key-table-form.service';

@Component({
  standalone: true,
  selector: 'jhi-key-table-update',
  templateUrl: './key-table-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class KeyTableUpdateComponent implements OnInit {
  isSaving = false;
  keyTable: IKeyTable | null = null;

  protected keyTableService = inject(KeyTableService);
  protected keyTableFormService = inject(KeyTableFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: KeyTableFormGroup = this.keyTableFormService.createKeyTableFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ keyTable }) => {
      this.keyTable = keyTable;
      if (keyTable) {
        this.updateForm(keyTable);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const keyTable = this.keyTableFormService.getKeyTable(this.editForm);
    if (keyTable.id !== null) {
      this.subscribeToSaveResponse(this.keyTableService.update(keyTable));
    } else {
      this.subscribeToSaveResponse(this.keyTableService.create(keyTable));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IKeyTable>>): void {
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

  protected updateForm(keyTable: IKeyTable): void {
    this.keyTable = keyTable;
    this.keyTableFormService.resetForm(this.editForm, keyTable);
  }
}
