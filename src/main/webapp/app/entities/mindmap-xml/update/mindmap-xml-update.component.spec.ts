import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, from } from 'rxjs';

import { MindmapXmlService } from '../service/mindmap-xml.service';
import { IMindmapXml } from '../mindmap-xml.model';
import { MindmapXmlFormService } from './mindmap-xml-form.service';

import { MindmapXmlUpdateComponent } from './mindmap-xml-update.component';

describe('MindmapXml Management Update Component', () => {
  let comp: MindmapXmlUpdateComponent;
  let fixture: ComponentFixture<MindmapXmlUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let mindmapXmlFormService: MindmapXmlFormService;
  let mindmapXmlService: MindmapXmlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MindmapXmlUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(MindmapXmlUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(MindmapXmlUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    mindmapXmlFormService = TestBed.inject(MindmapXmlFormService);
    mindmapXmlService = TestBed.inject(MindmapXmlService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const mindmapXml: IMindmapXml = { id: 'CBA' };

      activatedRoute.data = of({ mindmapXml });
      comp.ngOnInit();

      expect(comp.mindmapXml).toEqual(mindmapXml);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMindmapXml>>();
      const mindmapXml = { id: 'ABC' };
      jest.spyOn(mindmapXmlFormService, 'getMindmapXml').mockReturnValue(mindmapXml);
      jest.spyOn(mindmapXmlService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ mindmapXml });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: mindmapXml }));
      saveSubject.complete();

      // THEN
      expect(mindmapXmlFormService.getMindmapXml).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(mindmapXmlService.update).toHaveBeenCalledWith(expect.objectContaining(mindmapXml));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMindmapXml>>();
      const mindmapXml = { id: 'ABC' };
      jest.spyOn(mindmapXmlFormService, 'getMindmapXml').mockReturnValue({ id: null });
      jest.spyOn(mindmapXmlService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ mindmapXml: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: mindmapXml }));
      saveSubject.complete();

      // THEN
      expect(mindmapXmlFormService.getMindmapXml).toHaveBeenCalled();
      expect(mindmapXmlService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMindmapXml>>();
      const mindmapXml = { id: 'ABC' };
      jest.spyOn(mindmapXmlService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ mindmapXml });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(mindmapXmlService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
