import { Component, inject, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IUserMindmap } from '../user-mindmap.model';
import { UserMindmapService } from '../service/user-mindmap.service';
import { UserMindmapFormService, UserMindmapFormGroup } from './user-mindmap-form.service';

@Component({
  standalone: true,
  selector: 'jhi-user-mindmap-update',
  templateUrl: './user-mindmap-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class UserMindmapUpdateComponent implements OnInit {
  isSaving = false;
  userMindmap: IUserMindmap | null = null;

  usersSharedCollection: IUser[] = [];

  protected userMindmapService = inject(UserMindmapService);
  protected userMindmapFormService = inject(UserMindmapFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: UserMindmapFormGroup = this.userMindmapFormService.createUserMindmapFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ userMindmap }) => {
      this.userMindmap = userMindmap;
      if (userMindmap) {
        this.updateForm(userMindmap);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const userMindmap = this.userMindmapFormService.getUserMindmap(this.editForm);
    if (userMindmap.id !== null) {
      this.subscribeToSaveResponse(this.userMindmapService.update(userMindmap));
    } else {
      this.subscribeToSaveResponse(this.userMindmapService.create(userMindmap));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IUserMindmap>>): void {
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

  protected updateForm(userMindmap: IUserMindmap): void {
    this.userMindmap = userMindmap;
    this.userMindmapFormService.resetForm(this.editForm, userMindmap);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, userMindmap.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.userMindmap?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
