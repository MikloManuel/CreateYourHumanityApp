import { Component, inject, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { FriendrequestService } from '../service/friendrequest.service';
import { IFriendrequest } from '../friendrequest.model';
import { FriendrequestFormService, FriendrequestFormGroup } from './friendrequest-form.service';

@Component({
  standalone: true,
  selector: 'jhi-friendrequest-update',
  templateUrl: './friendrequest-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class FriendrequestUpdateComponent implements OnInit {
  isSaving = false;
  friendrequest: IFriendrequest | null = null;

  usersSharedCollection: IUser[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected friendrequestService = inject(FriendrequestService);
  protected friendrequestFormService = inject(FriendrequestFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: FriendrequestFormGroup = this.friendrequestFormService.createFriendrequestFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ friendrequest }) => {
      this.friendrequest = friendrequest;
      if (friendrequest) {
        this.updateForm(friendrequest);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(
          new EventWithContent<AlertError>('createyourhumanityApp.error', { ...err, key: 'error.file.' + err.key }),
        ),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const friendrequest = this.friendrequestFormService.getFriendrequest(this.editForm);
    if (friendrequest.id !== null) {
      this.subscribeToSaveResponse(this.friendrequestService.update(friendrequest));
    } else {
      this.subscribeToSaveResponse(this.friendrequestService.create(friendrequest));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFriendrequest>>): void {
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

  protected updateForm(friendrequest: IFriendrequest): void {
    this.friendrequest = friendrequest;
    this.friendrequestFormService.resetForm(this.editForm, friendrequest);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, friendrequest.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.friendrequest?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
