import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../user-details.test-samples';

import { UserDetailsFormService } from './user-details-form.service';

describe('UserDetails Form Service', () => {
  let service: UserDetailsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserDetailsFormService);
  });

  describe('Service methods', () => {
    describe('createUserDetailsFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createUserDetailsFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            dob: expect.any(Object),
            created: expect.any(Object),
            modified: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });

      it('passing IUserDetails should create a new form with FormGroup', () => {
        const formGroup = service.createUserDetailsFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            dob: expect.any(Object),
            created: expect.any(Object),
            modified: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });
    });

    describe('getUserDetails', () => {
      it('should return NewUserDetails for default UserDetails initial value', () => {
        const formGroup = service.createUserDetailsFormGroup(sampleWithNewData);

        const userDetails = service.getUserDetails(formGroup) as any;

        expect(userDetails).toMatchObject(sampleWithNewData);
      });

      it('should return NewUserDetails for empty UserDetails initial value', () => {
        const formGroup = service.createUserDetailsFormGroup();

        const userDetails = service.getUserDetails(formGroup) as any;

        expect(userDetails).toMatchObject({});
      });

      it('should return IUserDetails', () => {
        const formGroup = service.createUserDetailsFormGroup(sampleWithRequiredData);

        const userDetails = service.getUserDetails(formGroup) as any;

        expect(userDetails).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IUserDetails should not enable id FormControl', () => {
        const formGroup = service.createUserDetailsFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewUserDetails should disable id FormControl', () => {
        const formGroup = service.createUserDetailsFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
