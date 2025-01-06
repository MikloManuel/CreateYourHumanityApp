import { Component, inject, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IPrivacySettings } from '../privacy-settings.model';
import { PrivacySettingsService } from '../service/privacy-settings.service';
import { PrivacySettingsFormService, PrivacySettingsFormGroup } from './privacy-settings-form.service';

@Component({
  standalone: true,
  selector: 'jhi-privacy-settings-update',
  templateUrl: './privacy-settings-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PrivacySettingsUpdateComponent implements OnInit {
  isSaving = false;
  privacySettings: IPrivacySettings | null = null;

  usersSharedCollection: IUser[] = [];

  protected privacySettingsService = inject(PrivacySettingsService);
  protected privacySettingsFormService = inject(PrivacySettingsFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PrivacySettingsFormGroup = this.privacySettingsFormService.createPrivacySettingsFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ privacySettings }) => {
      this.privacySettings = privacySettings;
      if (privacySettings) {
        this.updateForm(privacySettings);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const privacySettings = this.privacySettingsFormService.getPrivacySettings(this.editForm);
    if (privacySettings.id !== null) {
      this.subscribeToSaveResponse(this.privacySettingsService.update(privacySettings));
    } else {
      this.subscribeToSaveResponse(this.privacySettingsService.create(privacySettings));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPrivacySettings>>): void {
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

  protected updateForm(privacySettings: IPrivacySettings): void {
    this.privacySettings = privacySettings;
    this.privacySettingsFormService.resetForm(this.editForm, privacySettings);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, privacySettings.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.privacySettings?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
