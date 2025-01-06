import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../key-table.test-samples';

import { KeyTableFormService } from './key-table-form.service';

describe('KeyTable Form Service', () => {
  let service: KeyTableFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyTableFormService);
  });

  describe('Service methods', () => {
    describe('createKeyTableFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createKeyTableFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            key: expect.any(Object),
            created: expect.any(Object),
            modified: expect.any(Object),
          }),
        );
      });

      it('passing IKeyTable should create a new form with FormGroup', () => {
        const formGroup = service.createKeyTableFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            key: expect.any(Object),
            created: expect.any(Object),
            modified: expect.any(Object),
          }),
        );
      });
    });

    describe('getKeyTable', () => {
      it('should return NewKeyTable for default KeyTable initial value', () => {
        const formGroup = service.createKeyTableFormGroup(sampleWithNewData);

        const keyTable = service.getKeyTable(formGroup) as any;

        expect(keyTable).toMatchObject(sampleWithNewData);
      });

      it('should return NewKeyTable for empty KeyTable initial value', () => {
        const formGroup = service.createKeyTableFormGroup();

        const keyTable = service.getKeyTable(formGroup) as any;

        expect(keyTable).toMatchObject({});
      });

      it('should return IKeyTable', () => {
        const formGroup = service.createKeyTableFormGroup(sampleWithRequiredData);

        const keyTable = service.getKeyTable(formGroup) as any;

        expect(keyTable).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IKeyTable should not enable id FormControl', () => {
        const formGroup = service.createKeyTableFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewKeyTable should disable id FormControl', () => {
        const formGroup = service.createKeyTableFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
