import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IUserDetails, NewUserDetails } from '../user-details.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IUserDetails for edit and NewUserDetailsFormGroupInput for create.
 */
type UserDetailsFormGroupInput = IUserDetails | PartialWithRequiredKeyOf<NewUserDetails>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IUserDetails | NewUserDetails> = Omit<T, 'dob' | 'created' | 'modified'> & {
  dob?: string | null;
  created?: string | null;
  modified?: string | null;
};

type UserDetailsFormRawValue = FormValueOf<IUserDetails>;

type NewUserDetailsFormRawValue = FormValueOf<NewUserDetails>;

type UserDetailsFormDefaults = Pick<NewUserDetails, 'id' | 'dob' | 'created' | 'modified'>;

type UserDetailsFormGroupContent = {
  id: FormControl<UserDetailsFormRawValue['id'] | NewUserDetails['id']>;
  dob: FormControl<UserDetailsFormRawValue['dob']>;
  created: FormControl<UserDetailsFormRawValue['created']>;
  modified: FormControl<UserDetailsFormRawValue['modified']>;
  user: FormControl<UserDetailsFormRawValue['user']>;
};

export type UserDetailsFormGroup = FormGroup<UserDetailsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class UserDetailsFormService {
  createUserDetailsFormGroup(userDetails: UserDetailsFormGroupInput = { id: null }): UserDetailsFormGroup {
    const userDetailsRawValue = this.convertUserDetailsToUserDetailsRawValue({
      ...this.getFormDefaults(),
      ...userDetails,
    });
    return new FormGroup<UserDetailsFormGroupContent>({
      id: new FormControl(
        { value: userDetailsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      dob: new FormControl(userDetailsRawValue.dob),
      created: new FormControl(userDetailsRawValue.created),
      modified: new FormControl(userDetailsRawValue.modified),
      user: new FormControl(userDetailsRawValue.user),
    });
  }

  getUserDetails(form: UserDetailsFormGroup): IUserDetails | NewUserDetails {
    return this.convertUserDetailsRawValueToUserDetails(form.getRawValue() as UserDetailsFormRawValue | NewUserDetailsFormRawValue);
  }

  resetForm(form: UserDetailsFormGroup, userDetails: UserDetailsFormGroupInput): void {
    const userDetailsRawValue = this.convertUserDetailsToUserDetailsRawValue({ ...this.getFormDefaults(), ...userDetails });
    form.reset(
      {
        ...userDetailsRawValue,
        id: { value: userDetailsRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): UserDetailsFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      dob: currentTime,
      created: currentTime,
      modified: currentTime,
    };
  }

  private convertUserDetailsRawValueToUserDetails(
    rawUserDetails: UserDetailsFormRawValue | NewUserDetailsFormRawValue,
  ): IUserDetails | NewUserDetails {
    return {
      ...rawUserDetails,
      dob: dayjs(rawUserDetails.dob, DATE_TIME_FORMAT),
      created: dayjs(rawUserDetails.created, DATE_TIME_FORMAT),
      modified: dayjs(rawUserDetails.modified, DATE_TIME_FORMAT),
    };
  }

  private convertUserDetailsToUserDetailsRawValue(
    userDetails: IUserDetails | (Partial<NewUserDetails> & UserDetailsFormDefaults),
  ): UserDetailsFormRawValue | PartialWithRequiredKeyOf<NewUserDetailsFormRawValue> {
    return {
      ...userDetails,
      dob: userDetails.dob ? userDetails.dob.format(DATE_TIME_FORMAT) : undefined,
      created: userDetails.created ? userDetails.created.format(DATE_TIME_FORMAT) : undefined,
      modified: userDetails.modified ? userDetails.modified.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
