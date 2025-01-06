import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IPrivacySettings, NewPrivacySettings } from '../privacy-settings.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPrivacySettings for edit and NewPrivacySettingsFormGroupInput for create.
 */
type PrivacySettingsFormGroupInput = IPrivacySettings | PartialWithRequiredKeyOf<NewPrivacySettings>;

type PrivacySettingsFormDefaults = Pick<NewPrivacySettings, 'id'>;

type PrivacySettingsFormGroupContent = {
  id: FormControl<IPrivacySettings['id'] | NewPrivacySettings['id']>;
  settingsMap: FormControl<IPrivacySettings['settingsMap']>;
  user: FormControl<IPrivacySettings['user']>;
};

export type PrivacySettingsFormGroup = FormGroup<PrivacySettingsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PrivacySettingsFormService {
  createPrivacySettingsFormGroup(privacySettings: PrivacySettingsFormGroupInput = { id: null }): PrivacySettingsFormGroup {
    const privacySettingsRawValue = {
      ...this.getFormDefaults(),
      ...privacySettings,
    };
    return new FormGroup<PrivacySettingsFormGroupContent>({
      id: new FormControl(
        { value: privacySettingsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      settingsMap: new FormControl(privacySettingsRawValue.settingsMap),
      user: new FormControl(privacySettingsRawValue.user),
    });
  }

  getPrivacySettings(form: PrivacySettingsFormGroup): IPrivacySettings | NewPrivacySettings {
    return form.getRawValue() as IPrivacySettings | NewPrivacySettings;
  }

  resetForm(form: PrivacySettingsFormGroup, privacySettings: PrivacySettingsFormGroupInput): void {
    const privacySettingsRawValue = { ...this.getFormDefaults(), ...privacySettings };
    form.reset(
      {
        ...privacySettingsRawValue,
        id: { value: privacySettingsRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PrivacySettingsFormDefaults {
    return {
      id: null,
    };
  }
}
