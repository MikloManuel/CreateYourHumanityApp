import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IFriendrequest } from '../friendrequest.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../friendrequest.test-samples';

import { FriendrequestService, RestFriendrequest } from './friendrequest.service';

const requireRestSample: RestFriendrequest = {
  ...sampleWithRequiredData,
  requestDate: sampleWithRequiredData.requestDate?.toJSON(),
};

describe('Friendrequest Service', () => {
  let service: FriendrequestService;
  let httpMock: HttpTestingController;
  let expectedResult: IFriendrequest | IFriendrequest[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(FriendrequestService);
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

    it('should create a Friendrequest', () => {
      const friendrequest = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(friendrequest).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Friendrequest', () => {
      const friendrequest = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(friendrequest).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Friendrequest', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Friendrequest', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Friendrequest', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a Friendrequest', () => {
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

    describe('addFriendrequestToCollectionIfMissing', () => {
      it('should add a Friendrequest to an empty array', () => {
        const friendrequest: IFriendrequest = sampleWithRequiredData;
        expectedResult = service.addFriendrequestToCollectionIfMissing([], friendrequest);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(friendrequest);
      });

      it('should not add a Friendrequest to an array that contains it', () => {
        const friendrequest: IFriendrequest = sampleWithRequiredData;
        const friendrequestCollection: IFriendrequest[] = [
          {
            ...friendrequest,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFriendrequestToCollectionIfMissing(friendrequestCollection, friendrequest);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Friendrequest to an array that doesn't contain it", () => {
        const friendrequest: IFriendrequest = sampleWithRequiredData;
        const friendrequestCollection: IFriendrequest[] = [sampleWithPartialData];
        expectedResult = service.addFriendrequestToCollectionIfMissing(friendrequestCollection, friendrequest);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(friendrequest);
      });

      it('should add only unique Friendrequest to an array', () => {
        const friendrequestArray: IFriendrequest[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const friendrequestCollection: IFriendrequest[] = [sampleWithRequiredData];
        expectedResult = service.addFriendrequestToCollectionIfMissing(friendrequestCollection, ...friendrequestArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const friendrequest: IFriendrequest = sampleWithRequiredData;
        const friendrequest2: IFriendrequest = sampleWithPartialData;
        expectedResult = service.addFriendrequestToCollectionIfMissing([], friendrequest, friendrequest2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(friendrequest);
        expect(expectedResult).toContain(friendrequest2);
      });

      it('should accept null and undefined values', () => {
        const friendrequest: IFriendrequest = sampleWithRequiredData;
        expectedResult = service.addFriendrequestToCollectionIfMissing([], null, friendrequest, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(friendrequest);
      });

      it('should return initial array if no Friendrequest is added', () => {
        const friendrequestCollection: IFriendrequest[] = [sampleWithRequiredData];
        expectedResult = service.addFriendrequestToCollectionIfMissing(friendrequestCollection, undefined, null);
        expect(expectedResult).toEqual(friendrequestCollection);
      });
    });

    describe('compareFriendrequest', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFriendrequest(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = null;

        const compareResult1 = service.compareFriendrequest(entity1, entity2);
        const compareResult2 = service.compareFriendrequest(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'CBA' };

        const compareResult1 = service.compareFriendrequest(entity1, entity2);
        const compareResult2 = service.compareFriendrequest(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'ABC' };

        const compareResult1 = service.compareFriendrequest(entity1, entity2);
        const compareResult2 = service.compareFriendrequest(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
