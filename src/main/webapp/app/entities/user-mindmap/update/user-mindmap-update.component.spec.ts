import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, from } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { UserMindmapService } from '../service/user-mindmap.service';
import { IUserMindmap } from '../user-mindmap.model';
import { UserMindmapFormService } from './user-mindmap-form.service';

import { UserMindmapUpdateComponent } from './user-mindmap-update.component';

describe('UserMindmap Management Update Component', () => {
  let comp: UserMindmapUpdateComponent;
  let fixture: ComponentFixture<UserMindmapUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let userMindmapFormService: UserMindmapFormService;
  let userMindmapService: UserMindmapService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserMindmapUpdateComponent],
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
      .overrideTemplate(UserMindmapUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(UserMindmapUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    userMindmapFormService = TestBed.inject(UserMindmapFormService);
    userMindmapService = TestBed.inject(UserMindmapService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const userMindmap: IUserMindmap = { id: 'CBA' };
      const user: IUser = { id: '17aa6bdb-98fa-4a87-8e5c-f5bad5e3b6e0' };
      userMindmap.user = user;

      const userCollection: IUser[] = [{ id: '90ed59ae-8691-4f48-8232-172f6b43de8b' }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ userMindmap });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const userMindmap: IUserMindmap = { id: 'CBA' };
      const user: IUser = { id: '41bd28ad-51fe-4236-b9a0-285859df038c' };
      userMindmap.user = user;

      activatedRoute.data = of({ userMindmap });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.userMindmap).toEqual(userMindmap);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserMindmap>>();
      const userMindmap = { id: 'ABC' };
      jest.spyOn(userMindmapFormService, 'getUserMindmap').mockReturnValue(userMindmap);
      jest.spyOn(userMindmapService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userMindmap });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: userMindmap }));
      saveSubject.complete();

      // THEN
      expect(userMindmapFormService.getUserMindmap).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(userMindmapService.update).toHaveBeenCalledWith(expect.objectContaining(userMindmap));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserMindmap>>();
      const userMindmap = { id: 'ABC' };
      jest.spyOn(userMindmapFormService, 'getUserMindmap').mockReturnValue({ id: null });
      jest.spyOn(userMindmapService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userMindmap: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: userMindmap }));
      saveSubject.complete();

      // THEN
      expect(userMindmapFormService.getUserMindmap).toHaveBeenCalled();
      expect(userMindmapService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IUserMindmap>>();
      const userMindmap = { id: 'ABC' };
      jest.spyOn(userMindmapService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userMindmap });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(userMindmapService.update).toHaveBeenCalled();
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
