import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../grant-settings.test-samples';

import { GrantSettingsFormService } from './grant-settings-form.service';

describe('GrantSettings Form Service', () => {
  let service: GrantSettingsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrantSettingsFormService);
  });

  describe('Service methods', () => {
    describe('createGrantSettingsFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createGrantSettingsFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            grantMap: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });

      it('passing IGrantSettings should create a new form with FormGroup', () => {
        const formGroup = service.createGrantSettingsFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            grantMap: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });
    });

    describe('getGrantSettings', () => {
      it('should return NewGrantSettings for default GrantSettings initial value', () => {
        const formGroup = service.createGrantSettingsFormGroup(sampleWithNewData);

        const grantSettings = service.getGrantSettings(formGroup) as any;

        expect(grantSettings).toMatchObject(sampleWithNewData);
      });

      it('should return NewGrantSettings for empty GrantSettings initial value', () => {
        const formGroup = service.createGrantSettingsFormGroup();

        const grantSettings = service.getGrantSettings(formGroup) as any;

        expect(grantSettings).toMatchObject({});
      });

      it('should return IGrantSettings', () => {
        const formGroup = service.createGrantSettingsFormGroup(sampleWithRequiredData);

        const grantSettings = service.getGrantSettings(formGroup) as any;

        expect(grantSettings).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IGrantSettings should not enable id FormControl', () => {
        const formGroup = service.createGrantSettingsFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewGrantSettings should disable id FormControl', () => {
        const formGroup = service.createGrantSettingsFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
