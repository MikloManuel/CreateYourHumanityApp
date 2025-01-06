import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, from } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { GrantSettingsService } from '../service/grant-settings.service';
import { IGrantSettings } from '../grant-settings.model';
import { GrantSettingsFormService } from './grant-settings-form.service';

import { GrantSettingsUpdateComponent } from './grant-settings-update.component';

describe('GrantSettings Management Update Component', () => {
  let comp: GrantSettingsUpdateComponent;
  let fixture: ComponentFixture<GrantSettingsUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let grantSettingsFormService: GrantSettingsFormService;
  let grantSettingsService: GrantSettingsService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GrantSettingsUpdateComponent],
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
      .overrideTemplate(GrantSettingsUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(GrantSettingsUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    grantSettingsFormService = TestBed.inject(GrantSettingsFormService);
    grantSettingsService = TestBed.inject(GrantSettingsService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const grantSettings: IGrantSettings = { id: 'CBA' };
      const user: IUser = { id: '74db0b1d-6876-468b-a629-ff6e17282141' };
      grantSettings.user = user;

      const userCollection: IUser[] = [{ id: 'e90949e1-8a61-41a1-87ff-bdc7a24000da' }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ grantSettings });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const grantSettings: IGrantSettings = { id: 'CBA' };
      const user: IUser = { id: 'eb6e498c-e36f-453a-a882-a4ebf670230a' };
      grantSettings.user = user;

      activatedRoute.data = of({ grantSettings });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.grantSettings).toEqual(grantSettings);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IGrantSettings>>();
      const grantSettings = { id: 'ABC' };
      jest.spyOn(grantSettingsFormService, 'getGrantSettings').mockReturnValue(grantSettings);
      jest.spyOn(grantSettingsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ grantSettings });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: grantSettings }));
      saveSubject.complete();

      // THEN
      expect(grantSettingsFormService.getGrantSettings).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(grantSettingsService.update).toHaveBeenCalledWith(expect.objectContaining(grantSettings));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IGrantSettings>>();
      const grantSettings = { id: 'ABC' };
      jest.spyOn(grantSettingsFormService, 'getGrantSettings').mockReturnValue({ id: null });
      jest.spyOn(grantSettingsService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ grantSettings: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: grantSettings }));
      saveSubject.complete();

      // THEN
      expect(grantSettingsFormService.getGrantSettings).toHaveBeenCalled();
      expect(grantSettingsService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IGrantSettings>>();
      const grantSettings = { id: 'ABC' };
      jest.spyOn(grantSettingsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ grantSettings });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(grantSettingsService.update).toHaveBeenCalled();
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
