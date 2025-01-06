import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IUserMindmap, NewUserMindmap } from '../user-mindmap.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IUserMindmap for edit and NewUserMindmapFormGroupInput for create.
 */
type UserMindmapFormGroupInput = IUserMindmap | PartialWithRequiredKeyOf<NewUserMindmap>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IUserMindmap | NewUserMindmap> = Omit<T, 'modified'> & {
  modified?: string | null;
};

type UserMindmapFormRawValue = FormValueOf<IUserMindmap>;

type NewUserMindmapFormRawValue = FormValueOf<NewUserMindmap>;

type UserMindmapFormDefaults = Pick<NewUserMindmap, 'id' | 'modified'>;

type UserMindmapFormGroupContent = {
  id: FormControl<UserMindmapFormRawValue['id'] | NewUserMindmap['id']>;
  text: FormControl<UserMindmapFormRawValue['text']>;
  modified: FormControl<UserMindmapFormRawValue['modified']>;
  user: FormControl<UserMindmapFormRawValue['user']>;
};

export type UserMindmapFormGroup = FormGroup<UserMindmapFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class UserMindmapFormService {
  createUserMindmapFormGroup(userMindmap: UserMindmapFormGroupInput = { id: null }): UserMindmapFormGroup {
    const userMindmapRawValue = this.convertUserMindmapToUserMindmapRawValue({
      ...this.getFormDefaults(),
      ...userMindmap,
    });
    return new FormGroup<UserMindmapFormGroupContent>({
      id: new FormControl(
        { value: userMindmapRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      text: new FormControl(userMindmapRawValue.text),
      modified: new FormControl(userMindmapRawValue.modified),
      user: new FormControl(userMindmapRawValue.user),
    });
  }

  getUserMindmap(form: UserMindmapFormGroup): IUserMindmap | NewUserMindmap {
    return this.convertUserMindmapRawValueToUserMindmap(form.getRawValue() as UserMindmapFormRawValue | NewUserMindmapFormRawValue);
  }

  resetForm(form: UserMindmapFormGroup, userMindmap: UserMindmapFormGroupInput): void {
    const userMindmapRawValue = this.convertUserMindmapToUserMindmapRawValue({ ...this.getFormDefaults(), ...userMindmap });
    form.reset(
      {
        ...userMindmapRawValue,
        id: { value: userMindmapRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): UserMindmapFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      modified: currentTime,
    };
  }

  private convertUserMindmapRawValueToUserMindmap(
    rawUserMindmap: UserMindmapFormRawValue | NewUserMindmapFormRawValue,
  ): IUserMindmap | NewUserMindmap {
    return {
      ...rawUserMindmap,
      modified: dayjs(rawUserMindmap.modified, DATE_TIME_FORMAT),
    };
  }

  private convertUserMindmapToUserMindmapRawValue(
    userMindmap: IUserMindmap | (Partial<NewUserMindmap> & UserMindmapFormDefaults),
  ): UserMindmapFormRawValue | PartialWithRequiredKeyOf<NewUserMindmapFormRawValue> {
    return {
      ...userMindmap,
      modified: userMindmap.modified ? userMindmap.modified.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
