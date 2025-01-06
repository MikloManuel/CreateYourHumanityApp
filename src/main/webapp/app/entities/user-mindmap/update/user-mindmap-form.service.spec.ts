import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../user-mindmap.test-samples';

import { UserMindmapFormService } from './user-mindmap-form.service';

describe('UserMindmap Form Service', () => {
  let service: UserMindmapFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserMindmapFormService);
  });

  describe('Service methods', () => {
    describe('createUserMindmapFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createUserMindmapFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            text: expect.any(Object),
            modified: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });

      it('passing IUserMindmap should create a new form with FormGroup', () => {
        const formGroup = service.createUserMindmapFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            text: expect.any(Object),
            modified: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });
    });

    describe('getUserMindmap', () => {
      it('should return NewUserMindmap for default UserMindmap initial value', () => {
        const formGroup = service.createUserMindmapFormGroup(sampleWithNewData);

        const userMindmap = service.getUserMindmap(formGroup) as any;

        expect(userMindmap).toMatchObject(sampleWithNewData);
      });

      it('should return NewUserMindmap for empty UserMindmap initial value', () => {
        const formGroup = service.createUserMindmapFormGroup();

        const userMindmap = service.getUserMindmap(formGroup) as any;

        expect(userMindmap).toMatchObject({});
      });

      it('should return IUserMindmap', () => {
        const formGroup = service.createUserMindmapFormGroup(sampleWithRequiredData);

        const userMindmap = service.getUserMindmap(formGroup) as any;

        expect(userMindmap).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IUserMindmap should not enable id FormControl', () => {
        const formGroup = service.createUserMindmapFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewUserMindmap should disable id FormControl', () => {
        const formGroup = service.createUserMindmapFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
