import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../friendrequest.test-samples';

import { FriendrequestFormService } from './friendrequest-form.service';

describe('Friendrequest Form Service', () => {
  let service: FriendrequestFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendrequestFormService);
  });

  describe('Service methods', () => {
    describe('createFriendrequestFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createFriendrequestFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            requestDate: expect.any(Object),
            requestUserId: expect.any(Object),
            info: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });

      it('passing IFriendrequest should create a new form with FormGroup', () => {
        const formGroup = service.createFriendrequestFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            requestDate: expect.any(Object),
            requestUserId: expect.any(Object),
            info: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });
    });

    describe('getFriendrequest', () => {
      it('should return NewFriendrequest for default Friendrequest initial value', () => {
        const formGroup = service.createFriendrequestFormGroup(sampleWithNewData);

        const friendrequest = service.getFriendrequest(formGroup) as any;

        expect(friendrequest).toMatchObject(sampleWithNewData);
      });

      it('should return NewFriendrequest for empty Friendrequest initial value', () => {
        const formGroup = service.createFriendrequestFormGroup();

        const friendrequest = service.getFriendrequest(formGroup) as any;

        expect(friendrequest).toMatchObject({});
      });

      it('should return IFriendrequest', () => {
        const formGroup = service.createFriendrequestFormGroup(sampleWithRequiredData);

        const friendrequest = service.getFriendrequest(formGroup) as any;

        expect(friendrequest).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IFriendrequest should not enable id FormControl', () => {
        const formGroup = service.createFriendrequestFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewFriendrequest should disable id FormControl', () => {
        const formGroup = service.createFriendrequestFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
