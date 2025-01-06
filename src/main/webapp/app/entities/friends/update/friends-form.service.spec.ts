import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../friends.test-samples';

import { FriendsFormService } from './friends-form.service';

describe('Friends Form Service', () => {
  let service: FriendsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendsFormService);
  });

  describe('Service methods', () => {
    describe('createFriendsFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createFriendsFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            connectDate: expect.any(Object),
            friendId: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });

      it('passing IFriends should create a new form with FormGroup', () => {
        const formGroup = service.createFriendsFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            connectDate: expect.any(Object),
            friendId: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });
    });

    describe('getFriends', () => {
      it('should return NewFriends for default Friends initial value', () => {
        const formGroup = service.createFriendsFormGroup(sampleWithNewData);

        const friends = service.getFriends(formGroup) as any;

        expect(friends).toMatchObject(sampleWithNewData);
      });

      it('should return NewFriends for empty Friends initial value', () => {
        const formGroup = service.createFriendsFormGroup();

        const friends = service.getFriends(formGroup) as any;

        expect(friends).toMatchObject({});
      });

      it('should return IFriends', () => {
        const formGroup = service.createFriendsFormGroup(sampleWithRequiredData);

        const friends = service.getFriends(formGroup) as any;

        expect(friends).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IFriends should not enable id FormControl', () => {
        const formGroup = service.createFriendsFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewFriends should disable id FormControl', () => {
        const formGroup = service.createFriendsFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
