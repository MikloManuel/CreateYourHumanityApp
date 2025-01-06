import { Component, inject, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IFriends } from '../friends.model';
import { FriendsService } from '../service/friends.service';
import { FriendsFormService, FriendsFormGroup } from './friends-form.service';

@Component({
  standalone: true,
  selector: 'jhi-friends-update',
  templateUrl: './friends-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class FriendsUpdateComponent implements OnInit {
  isSaving = false;
  friends: IFriends | null = null;

  usersSharedCollection: IUser[] = [];

  protected friendsService = inject(FriendsService);
  protected friendsFormService = inject(FriendsFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: FriendsFormGroup = this.friendsFormService.createFriendsFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ friends }) => {
      this.friends = friends;
      if (friends) {
        this.updateForm(friends);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const friends = this.friendsFormService.getFriends(this.editForm);
    if (friends.id !== null) {
      this.subscribeToSaveResponse(this.friendsService.update(friends));
    } else {
      this.subscribeToSaveResponse(this.friendsService.create(friends));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFriends>>): void {
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

  protected updateForm(friends: IFriends): void {
    this.friends = friends;
    this.friendsFormService.resetForm(this.editForm, friends);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, friends.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.friends?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
