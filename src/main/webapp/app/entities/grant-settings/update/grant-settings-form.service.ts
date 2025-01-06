import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IGrantSettings, NewGrantSettings } from '../grant-settings.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IGrantSettings for edit and NewGrantSettingsFormGroupInput for create.
 */
type GrantSettingsFormGroupInput = IGrantSettings | PartialWithRequiredKeyOf<NewGrantSettings>;

type GrantSettingsFormDefaults = Pick<NewGrantSettings, 'id'>;

type GrantSettingsFormGroupContent = {
  id: FormControl<IGrantSettings['id'] | NewGrantSettings['id']>;
  grantMap: FormControl<IGrantSettings['grantMap']>;
  user: FormControl<IGrantSettings['user']>;
};

export type GrantSettingsFormGroup = FormGroup<GrantSettingsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class GrantSettingsFormService {
  createGrantSettingsFormGroup(grantSettings: GrantSettingsFormGroupInput = { id: null }): GrantSettingsFormGroup {
    const grantSettingsRawValue = {
      ...this.getFormDefaults(),
      ...grantSettings,
    };
    return new FormGroup<GrantSettingsFormGroupContent>({
      id: new FormControl(
        { value: grantSettingsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      grantMap: new FormControl(grantSettingsRawValue.grantMap),
      user: new FormControl(grantSettingsRawValue.user),
    });
  }

  getGrantSettings(form: GrantSettingsFormGroup): IGrantSettings | NewGrantSettings {
    return form.getRawValue() as IGrantSettings | NewGrantSettings;
  }

  resetForm(form: GrantSettingsFormGroup, grantSettings: GrantSettingsFormGroupInput): void {
    const grantSettingsRawValue = { ...this.getFormDefaults(), ...grantSettings };
    form.reset(
      {
        ...grantSettingsRawValue,
        id: { value: grantSettingsRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): GrantSettingsFormDefaults {
    return {
      id: null,
    };
  }
}
