import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, from } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { PrivacySettingsService } from '../service/privacy-settings.service';
import { IPrivacySettings } from '../privacy-settings.model';
import { PrivacySettingsFormService } from './privacy-settings-form.service';

import { PrivacySettingsUpdateComponent } from './privacy-settings-update.component';

describe('PrivacySettings Management Update Component', () => {
  let comp: PrivacySettingsUpdateComponent;
  let fixture: ComponentFixture<PrivacySettingsUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let privacySettingsFormService: PrivacySettingsFormService;
  let privacySettingsService: PrivacySettingsService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PrivacySettingsUpdateComponent],
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
      .overrideTemplate(PrivacySettingsUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PrivacySettingsUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    privacySettingsFormService = TestBed.inject(PrivacySettingsFormService);
    privacySettingsService = TestBed.inject(PrivacySettingsService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const privacySettings: IPrivacySettings = { id: 'CBA' };
      const user: IUser = { id: 'b3472cd3-93d4-4118-9138-b7bfbd6072ac' };
      privacySettings.user = user;

      const userCollection: IUser[] = [{ id: '241d5c35-c10f-4b14-8d30-416afc34276f' }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ privacySettings });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const privacySettings: IPrivacySettings = { id: 'CBA' };
      const user: IUser = { id: 'b5d6f485-e03b-4513-9331-dcad01eb5d2c' };
      privacySettings.user = user;

      activatedRoute.data = of({ privacySettings });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.privacySettings).toEqual(privacySettings);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPrivacySettings>>();
      const privacySettings = { id: 'ABC' };
      jest.spyOn(privacySettingsFormService, 'getPrivacySettings').mockReturnValue(privacySettings);
      jest.spyOn(privacySettingsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ privacySettings });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: privacySettings }));
      saveSubject.complete();

      // THEN
      expect(privacySettingsFormService.getPrivacySettings).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(privacySettingsService.update).toHaveBeenCalledWith(expect.objectContaining(privacySettings));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPrivacySettings>>();
      const privacySettings = { id: 'ABC' };
      jest.spyOn(privacySettingsFormService, 'getPrivacySettings').mockReturnValue({ id: null });
      jest.spyOn(privacySettingsService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ privacySettings: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: privacySettings }));
      saveSubject.complete();

      // THEN
      expect(privacySettingsFormService.getPrivacySettings).toHaveBeenCalled();
      expect(privacySettingsService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPrivacySettings>>();
      const privacySettings = { id: 'ABC' };
      jest.spyOn(privacySettingsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ privacySettings });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(privacySettingsService.update).toHaveBeenCalled();
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
