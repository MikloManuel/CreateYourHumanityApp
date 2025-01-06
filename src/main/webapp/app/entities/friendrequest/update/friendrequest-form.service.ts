import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IFriendrequest, NewFriendrequest } from '../friendrequest.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFriendrequest for edit and NewFriendrequestFormGroupInput for create.
 */
type FriendrequestFormGroupInput = IFriendrequest | PartialWithRequiredKeyOf<NewFriendrequest>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IFriendrequest | NewFriendrequest> = Omit<T, 'requestDate'> & {
  requestDate?: string | null;
};

type FriendrequestFormRawValue = FormValueOf<IFriendrequest>;

type NewFriendrequestFormRawValue = FormValueOf<NewFriendrequest>;

type FriendrequestFormDefaults = Pick<NewFriendrequest, 'id' | 'requestDate'>;

type FriendrequestFormGroupContent = {
  id: FormControl<FriendrequestFormRawValue['id'] | NewFriendrequest['id']>;
  requestDate: FormControl<FriendrequestFormRawValue['requestDate']>;
  requestUserId: FormControl<FriendrequestFormRawValue['requestUserId']>;
  info: FormControl<FriendrequestFormRawValue['info']>;
  user: FormControl<FriendrequestFormRawValue['user']>;
};

export type FriendrequestFormGroup = FormGroup<FriendrequestFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FriendrequestFormService {
  createFriendrequestFormGroup(friendrequest: FriendrequestFormGroupInput = { id: null }): FriendrequestFormGroup {
    const friendrequestRawValue = this.convertFriendrequestToFriendrequestRawValue({
      ...this.getFormDefaults(),
      ...friendrequest,
    });
    return new FormGroup<FriendrequestFormGroupContent>({
      id: new FormControl(
        { value: friendrequestRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      requestDate: new FormControl(friendrequestRawValue.requestDate),
      requestUserId: new FormControl(friendrequestRawValue.requestUserId),
      info: new FormControl(friendrequestRawValue.info),
      user: new FormControl(friendrequestRawValue.user),
    });
  }

  getFriendrequest(form: FriendrequestFormGroup): IFriendrequest | NewFriendrequest {
    return this.convertFriendrequestRawValueToFriendrequest(form.getRawValue() as FriendrequestFormRawValue | NewFriendrequestFormRawValue);
  }

  resetForm(form: FriendrequestFormGroup, friendrequest: FriendrequestFormGroupInput): void {
    const friendrequestRawValue = this.convertFriendrequestToFriendrequestRawValue({ ...this.getFormDefaults(), ...friendrequest });
    form.reset(
      {
        ...friendrequestRawValue,
        id: { value: friendrequestRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): FriendrequestFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      requestDate: currentTime,
    };
  }

  private convertFriendrequestRawValueToFriendrequest(
    rawFriendrequest: FriendrequestFormRawValue | NewFriendrequestFormRawValue,
  ): IFriendrequest | NewFriendrequest {
    return {
      ...rawFriendrequest,
      requestDate: dayjs(rawFriendrequest.requestDate, DATE_TIME_FORMAT),
    };
  }

  private convertFriendrequestToFriendrequestRawValue(
    friendrequest: IFriendrequest | (Partial<NewFriendrequest> & FriendrequestFormDefaults),
  ): FriendrequestFormRawValue | PartialWithRequiredKeyOf<NewFriendrequestFormRawValue> {
    return {
      ...friendrequest,
      requestDate: friendrequest.requestDate ? friendrequest.requestDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
