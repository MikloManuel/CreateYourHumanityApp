import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, from } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { FormulaDataService } from '../service/formula-data.service';
import { IFormulaData } from '../formula-data.model';
import { FormulaDataFormService } from './formula-data-form.service';

import { FormulaDataUpdateComponent } from './formula-data-update.component';

describe('FormulaData Management Update Component', () => {
  let comp: FormulaDataUpdateComponent;
  let fixture: ComponentFixture<FormulaDataUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let formulaDataFormService: FormulaDataFormService;
  let formulaDataService: FormulaDataService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormulaDataUpdateComponent],
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
      .overrideTemplate(FormulaDataUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FormulaDataUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    formulaDataFormService = TestBed.inject(FormulaDataFormService);
    formulaDataService = TestBed.inject(FormulaDataService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const formulaData: IFormulaData = { id: 'CBA' };
      const user: IUser = { id: '4e721970-f867-4627-bd3d-7265264b9bbf' };
      formulaData.user = user;

      const userCollection: IUser[] = [{ id: '4bb72124-bad9-4848-be96-0bacdcc776d6' }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ formulaData });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const formulaData: IFormulaData = { id: 'CBA' };
      const user: IUser = { id: '75aa936a-ae7a-4886-8d3f-d0c7eab04fc0' };
      formulaData.user = user;

      activatedRoute.data = of({ formulaData });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.formulaData).toEqual(formulaData);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFormulaData>>();
      const formulaData = { id: 'ABC' };
      jest.spyOn(formulaDataFormService, 'getFormulaData').mockReturnValue(formulaData);
      jest.spyOn(formulaDataService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ formulaData });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: formulaData }));
      saveSubject.complete();

      // THEN
      expect(formulaDataFormService.getFormulaData).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(formulaDataService.update).toHaveBeenCalledWith(expect.objectContaining(formulaData));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFormulaData>>();
      const formulaData = { id: 'ABC' };
      jest.spyOn(formulaDataFormService, 'getFormulaData').mockReturnValue({ id: null });
      jest.spyOn(formulaDataService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ formulaData: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: formulaData }));
      saveSubject.complete();

      // THEN
      expect(formulaDataFormService.getFormulaData).toHaveBeenCalled();
      expect(formulaDataService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFormulaData>>();
      const formulaData = { id: 'ABC' };
      jest.spyOn(formulaDataService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ formulaData });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(formulaDataService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUser', () => {
      it('Should forward to userService', () => {
        const entity = { id: 'ABC' };
        const entity2 = { id: 'CBA' };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
