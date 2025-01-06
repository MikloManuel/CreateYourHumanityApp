import { Component, inject, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IFormulaData } from '../formula-data.model';
import { FormulaDataService } from '../service/formula-data.service';
import { FormulaDataFormService, FormulaDataFormGroup } from './formula-data-form.service';

@Component({
  standalone: true,
  selector: 'jhi-formula-data-update',
  templateUrl: './formula-data-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class FormulaDataUpdateComponent implements OnInit {
  isSaving = false;
  formulaData: IFormulaData | null = null;

  usersSharedCollection: IUser[] = [];

  protected formulaDataService = inject(FormulaDataService);
  protected formulaDataFormService = inject(FormulaDataFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: FormulaDataFormGroup = this.formulaDataFormService.createFormulaDataFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ formulaData }) => {
      this.formulaData = formulaData;
      if (formulaData) {
        this.updateForm(formulaData);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const formulaData = this.formulaDataFormService.getFormulaData(this.editForm);
    if (formulaData.id !== null) {
      this.subscribeToSaveResponse(this.formulaDataService.update(formulaData));
    } else {
      this.subscribeToSaveResponse(this.formulaDataService.create(formulaData));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFormulaData>>): void {
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

  protected updateForm(formulaData: IFormulaData): void {
    this.formulaData = formulaData;
    this.formulaDataFormService.resetForm(this.editForm, formulaData);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, formulaData.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.formulaData?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
