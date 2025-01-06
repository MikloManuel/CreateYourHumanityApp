import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, from } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { FriendrequestService } from '../service/friendrequest.service';
import { IFriendrequest } from '../friendrequest.model';
import { FriendrequestFormService } from './friendrequest-form.service';

import { FriendrequestUpdateComponent } from './friendrequest-update.component';

describe('Friendrequest Management Update Component', () => {
  let comp: FriendrequestUpdateComponent;
  let fixture: ComponentFixture<FriendrequestUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let friendrequestFormService: FriendrequestFormService;
  let friendrequestService: FriendrequestService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FriendrequestUpdateComponent],
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
      .overrideTemplate(FriendrequestUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FriendrequestUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    friendrequestFormService = TestBed.inject(FriendrequestFormService);
    friendrequestService = TestBed.inject(FriendrequestService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const friendrequest: IFriendrequest = { id: 'CBA' };
      const user: IUser = { id: 'b52aab13-0e95-4254-a46b-9b451833b85a' };
      friendrequest.user = user;

      const userCollection: IUser[] = [{ id: '23b80e58-d15e-44a8-8c93-af38740fdcac' }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ friendrequest });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const friendrequest: IFriendrequest = { id: 'CBA' };
      const user: IUser = { id: 'ac51d55f-ce62-436c-b9a4-aa52cd723303' };
      friendrequest.user = user;

      activatedRoute.data = of({ friendrequest });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.friendrequest).toEqual(friendrequest);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFriendrequest>>();
      const friendrequest = { id: 'ABC' };
      jest.spyOn(friendrequestFormService, 'getFriendrequest').mockReturnValue(friendrequest);
      jest.spyOn(friendrequestService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ friendrequest });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: friendrequest }));
      saveSubject.complete();

      // THEN
      expect(friendrequestFormService.getFriendrequest).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(friendrequestService.update).toHaveBeenCalledWith(expect.objectContaining(friendrequest));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFriendrequest>>();
      const friendrequest = { id: 'ABC' };
      jest.spyOn(friendrequestFormService, 'getFriendrequest').mockReturnValue({ id: null });
      jest.spyOn(friendrequestService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ friendrequest: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: friendrequest }));
      saveSubject.complete();

      // THEN
      expect(friendrequestFormService.getFriendrequest).toHaveBeenCalled();
      expect(friendrequestService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFriendrequest>>();
      const friendrequest = { id: 'ABC' };
      jest.spyOn(friendrequestService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ friendrequest });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(friendrequestService.update).toHaveBeenCalled();
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
