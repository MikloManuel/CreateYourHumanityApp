import { Component, inject, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IGrantSettings } from '../grant-settings.model';
import { GrantSettingsService } from '../service/grant-settings.service';
import { GrantSettingsFormService, GrantSettingsFormGroup } from './grant-settings-form.service';

@Component({
  standalone: true,
  selector: 'jhi-grant-settings-update',
  templateUrl: './grant-settings-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class GrantSettingsUpdateComponent implements OnInit {
  isSaving = false;
  grantSettings: IGrantSettings | null = null;

  usersSharedCollection: IUser[] = [];

  protected grantSettingsService = inject(GrantSettingsService);
  protected grantSettingsFormService = inject(GrantSettingsFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: GrantSettingsFormGroup = this.grantSettingsFormService.createGrantSettingsFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ grantSettings }) => {
      this.grantSettings = grantSettings;
      if (grantSettings) {
        this.updateForm(grantSettings);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const grantSettings = this.grantSettingsFormService.getGrantSettings(this.editForm);
    if (grantSettings.id !== null) {
      this.subscribeToSaveResponse(this.grantSettingsService.update(grantSettings));
    } else {
      this.subscribeToSaveResponse(this.grantSettingsService.create(grantSettings));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IGrantSettings>>): void {
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

  protected updateForm(grantSettings: IGrantSettings): void {
    this.grantSettings = grantSettings;
    this.grantSettingsFormService.resetForm(this.editForm, grantSettings);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, grantSettings.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.grantSettings?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
