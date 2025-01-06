import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, from } from 'rxjs';

import { KeyTableService } from '../service/key-table.service';
import { IKeyTable } from '../key-table.model';
import { KeyTableFormService } from './key-table-form.service';

import { KeyTableUpdateComponent } from './key-table-update.component';

describe('KeyTable Management Update Component', () => {
  let comp: KeyTableUpdateComponent;
  let fixture: ComponentFixture<KeyTableUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let keyTableFormService: KeyTableFormService;
  let keyTableService: KeyTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KeyTableUpdateComponent],
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
      .overrideTemplate(KeyTableUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(KeyTableUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    keyTableFormService = TestBed.inject(KeyTableFormService);
    keyTableService = TestBed.inject(KeyTableService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const keyTable: IKeyTable = { id: 'CBA' };

      activatedRoute.data = of({ keyTable });
      comp.ngOnInit();

      expect(comp.keyTable).toEqual(keyTable);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IKeyTable>>();
      const keyTable = { id: 'ABC' };
      jest.spyOn(keyTableFormService, 'getKeyTable').mockReturnValue(keyTable);
      jest.spyOn(keyTableService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ keyTable });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: keyTable }));
      saveSubject.complete();

      // THEN
      expect(keyTableFormService.getKeyTable).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(keyTableService.update).toHaveBeenCalledWith(expect.objectContaining(keyTable));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IKeyTable>>();
      const keyTable = { id: 'ABC' };
      jest.spyOn(keyTableFormService, 'getKeyTable').mockReturnValue({ id: null });
      jest.spyOn(keyTableService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ keyTable: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: keyTable }));
      saveSubject.complete();

      // THEN
      expect(keyTableFormService.getKeyTable).toHaveBeenCalled();
      expect(keyTableService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IKeyTable>>();
      const keyTable = { id: 'ABC' };
      jest.spyOn(keyTableService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ keyTable });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(keyTableService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
