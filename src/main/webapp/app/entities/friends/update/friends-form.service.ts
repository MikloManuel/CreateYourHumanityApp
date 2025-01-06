import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IFriends, NewFriends } from '../friends.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFriends for edit and NewFriendsFormGroupInput for create.
 */
type FriendsFormGroupInput = IFriends | PartialWithRequiredKeyOf<NewFriends>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IFriends | NewFriends> = Omit<T, 'connectDate'> & {
  connectDate?: string | null;
};

type FriendsFormRawValue = FormValueOf<IFriends>;

type NewFriendsFormRawValue = FormValueOf<NewFriends>;

type FriendsFormDefaults = Pick<NewFriends, 'id' | 'connectDate'>;

type FriendsFormGroupContent = {
  id: FormControl<FriendsFormRawValue['id'] | NewFriends['id']>;
  connectDate: FormControl<FriendsFormRawValue['connectDate']>;
  friendId: FormControl<FriendsFormRawValue['friendId']>;
  user: FormControl<FriendsFormRawValue['user']>;
};

export type FriendsFormGroup = FormGroup<FriendsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FriendsFormService {
  createFriendsFormGroup(friends: FriendsFormGroupInput = { id: null }): FriendsFormGroup {
    const friendsRawValue = this.convertFriendsToFriendsRawValue({
      ...this.getFormDefaults(),
      ...friends,
    });
    return new FormGroup<FriendsFormGroupContent>({
      id: new FormControl(
        { value: friendsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      connectDate: new FormControl(friendsRawValue.connectDate),
      friendId: new FormControl(friendsRawValue.friendId),
      user: new FormControl(friendsRawValue.user),
    });
  }

  getFriends(form: FriendsFormGroup): IFriends | NewFriends {
    return this.convertFriendsRawValueToFriends(form.getRawValue() as FriendsFormRawValue | NewFriendsFormRawValue);
  }

  resetForm(form: FriendsFormGroup, friends: FriendsFormGroupInput): void {
    const friendsRawValue = this.convertFriendsToFriendsRawValue({ ...this.getFormDefaults(), ...friends });
    form.reset(
      {
        ...friendsRawValue,
        id: { value: friendsRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): FriendsFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      connectDate: currentTime,
    };
  }

  private convertFriendsRawValueToFriends(rawFriends: FriendsFormRawValue | NewFriendsFormRawValue): IFriends | NewFriends {
    return {
      ...rawFriends,
      connectDate: dayjs(rawFriends.connectDate, DATE_TIME_FORMAT),
    };
  }

  private convertFriendsToFriendsRawValue(
    friends: IFriends | (Partial<NewFriends> & FriendsFormDefaults),
  ): FriendsFormRawValue | PartialWithRequiredKeyOf<NewFriendsFormRawValue> {
    return {
      ...friends,
      connectDate: friends.connectDate ? friends.connectDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
