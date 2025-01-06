import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IFriends } from '../friends.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../friends.test-samples';

import { FriendsService, RestFriends } from './friends.service';

const requireRestSample: RestFriends = {
  ...sampleWithRequiredData,
  connectDate: sampleWithRequiredData.connectDate?.toJSON(),
};

describe('Friends Service', () => {
  let service: FriendsService;
  let httpMock: HttpTestingController;
  let expectedResult: IFriends | IFriends[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(FriendsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find('ABC').subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Friends', () => {
      const friends = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(friends).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Friends', () => {
      const friends = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(friends).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Friends', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Friends', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Friends', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a Friends', () => {
      const queryObject: any = {
        page: 0,
        size: 20,
        query: '',
        sort: [],
      };
      service.search(queryObject).subscribe(() => expectedResult);

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      expect(expectedResult).toBe(null);
    });

    describe('addFriendsToCollectionIfMissing', () => {
      it('should add a Friends to an empty array', () => {
        const friends: IFriends = sampleWithRequiredData;
        expectedResult = service.addFriendsToCollectionIfMissing([], friends);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(friends);
      });

      it('should not add a Friends to an array that contains it', () => {
        const friends: IFriends = sampleWithRequiredData;
        const friendsCollection: IFriends[] = [
          {
            ...friends,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFriendsToCollectionIfMissing(friendsCollection, friends);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Friends to an array that doesn't contain it", () => {
        const friends: IFriends = sampleWithRequiredData;
        const friendsCollection: IFriends[] = [sampleWithPartialData];
        expectedResult = service.addFriendsToCollectionIfMissing(friendsCollection, friends);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(friends);
      });

      it('should add only unique Friends to an array', () => {
        const friendsArray: IFriends[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const friendsCollection: IFriends[] = [sampleWithRequiredData];
        expectedResult = service.addFriendsToCollectionIfMissing(friendsCollection, ...friendsArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const friends: IFriends = sampleWithRequiredData;
        const friends2: IFriends = sampleWithPartialData;
        expectedResult = service.addFriendsToCollectionIfMissing([], friends, friends2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(friends);
        expect(expectedResult).toContain(friends2);
      });

      it('should accept null and undefined values', () => {
        const friends: IFriends = sampleWithRequiredData;
        expectedResult = service.addFriendsToCollectionIfMissing([], null, friends, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(friends);
      });

      it('should return initial array if no Friends is added', () => {
        const friendsCollection: IFriends[] = [sampleWithRequiredData];
        expectedResult = service.addFriendsToCollectionIfMissing(friendsCollection, undefined, null);
        expect(expectedResult).toEqual(friendsCollection);
      });
    });

    describe('compareFriends', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFriends(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = null;

        const compareResult1 = service.compareFriends(entity1, entity2);
        const compareResult2 = service.compareFriends(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'CBA' };

        const compareResult1 = service.compareFriends(entity1, entity2);
        const compareResult2 = service.compareFriends(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'ABC' };

        const compareResult1 = service.compareFriends(entity1, entity2);
        const compareResult2 = service.compareFriends(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
