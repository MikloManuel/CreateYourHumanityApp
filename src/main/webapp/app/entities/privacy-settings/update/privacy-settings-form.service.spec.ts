import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../privacy-settings.test-samples';

import { PrivacySettingsFormService } from './privacy-settings-form.service';

describe('PrivacySettings Form Service', () => {
  let service: PrivacySettingsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivacySettingsFormService);
  });

  describe('Service methods', () => {
    describe('createPrivacySettingsFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPrivacySettingsFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            settingsMap: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });

      it('passing IPrivacySettings should create a new form with FormGroup', () => {
        const formGroup = service.createPrivacySettingsFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            settingsMap: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });
    });

    describe('getPrivacySettings', () => {
      it('should return NewPrivacySettings for default PrivacySettings initial value', () => {
        const formGroup = service.createPrivacySettingsFormGroup(sampleWithNewData);

        const privacySettings = service.getPrivacySettings(formGroup) as any;

        expect(privacySettings).toMatchObject(sampleWithNewData);
      });

      it('should return NewPrivacySettings for empty PrivacySettings initial value', () => {
        const formGroup = service.createPrivacySettingsFormGroup();

        const privacySettings = service.getPrivacySettings(formGroup) as any;

        expect(privacySettings).toMatchObject({});
      });

      it('should return IPrivacySettings', () => {
        const formGroup = service.createPrivacySettingsFormGroup(sampleWithRequiredData);

        const privacySettings = service.getPrivacySettings(formGroup) as any;

        expect(privacySettings).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPrivacySettings should not enable id FormControl', () => {
        const formGroup = service.createPrivacySettingsFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPrivacySettings should disable id FormControl', () => {
        const formGroup = service.createPrivacySettingsFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
