import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../mindmap-xml.test-samples';

import { MindmapXmlFormService } from './mindmap-xml-form.service';

describe('MindmapXml Form Service', () => {
  let service: MindmapXmlFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MindmapXmlFormService);
  });

  describe('Service methods', () => {
    describe('createMindmapXmlFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createMindmapXmlFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            text: expect.any(Object),
            modified: expect.any(Object),
          }),
        );
      });

      it('passing IMindmapXml should create a new form with FormGroup', () => {
        const formGroup = service.createMindmapXmlFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            text: expect.any(Object),
            modified: expect.any(Object),
          }),
        );
      });
    });

    describe('getMindmapXml', () => {
      it('should return NewMindmapXml for default MindmapXml initial value', () => {
        const formGroup = service.createMindmapXmlFormGroup(sampleWithNewData);

        const mindmapXml = service.getMindmapXml(formGroup) as any;

        expect(mindmapXml).toMatchObject(sampleWithNewData);
      });

      it('should return NewMindmapXml for empty MindmapXml initial value', () => {
        const formGroup = service.createMindmapXmlFormGroup();

        const mindmapXml = service.getMindmapXml(formGroup) as any;

        expect(mindmapXml).toMatchObject({});
      });

      it('should return IMindmapXml', () => {
        const formGroup = service.createMindmapXmlFormGroup(sampleWithRequiredData);

        const mindmapXml = service.getMindmapXml(formGroup) as any;

        expect(mindmapXml).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IMindmapXml should not enable id FormControl', () => {
        const formGroup = service.createMindmapXmlFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewMindmapXml should disable id FormControl', () => {
        const formGroup = service.createMindmapXmlFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
