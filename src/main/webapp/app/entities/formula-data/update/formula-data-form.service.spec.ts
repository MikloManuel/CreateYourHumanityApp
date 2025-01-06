import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../formula-data.test-samples';

import { FormulaDataFormService } from './formula-data-form.service';

describe('FormulaData Form Service', () => {
  let service: FormulaDataFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormulaDataFormService);
  });

  describe('Service methods', () => {
    describe('createFormulaDataFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createFormulaDataFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            map: expect.any(Object),
            created: expect.any(Object),
            modified: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });

      it('passing IFormulaData should create a new form with FormGroup', () => {
        const formGroup = service.createFormulaDataFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            map: expect.any(Object),
            created: expect.any(Object),
            modified: expect.any(Object),
            user: expect.any(Object),
          }),
        );
      });
    });

    describe('getFormulaData', () => {
      it('should return NewFormulaData for default FormulaData initial value', () => {
        const formGroup = service.createFormulaDataFormGroup(sampleWithNewData);

        const formulaData = service.getFormulaData(formGroup) as any;

        expect(formulaData).toMatchObject(sampleWithNewData);
      });

      it('should return NewFormulaData for empty FormulaData initial value', () => {
        const formGroup = service.createFormulaDataFormGroup();

        const formulaData = service.getFormulaData(formGroup) as any;

        expect(formulaData).toMatchObject({});
      });

      it('should return IFormulaData', () => {
        const formGroup = service.createFormulaDataFormGroup(sampleWithRequiredData);

        const formulaData = service.getFormulaData(formGroup) as any;

        expect(formulaData).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IFormulaData should not enable id FormControl', () => {
        const formGroup = service.createFormulaDataFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewFormulaData should disable id FormControl', () => {
        const formGroup = service.createFormulaDataFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
