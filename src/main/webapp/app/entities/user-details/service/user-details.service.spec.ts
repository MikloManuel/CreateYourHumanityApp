import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IUserDetails } from '../user-details.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../user-details.test-samples';

import { UserDetailsService, RestUserDetails } from './user-details.service';

const requireRestSample: RestUserDetails = {
  ...sampleWithRequiredData,
  dob: sampleWithRequiredData.dob?.toJSON(),
  created: sampleWithRequiredData.created?.toJSON(),
  modified: sampleWithRequiredData.modified?.toJSON(),
};

describe('UserDetails Service', () => {
  let service: UserDetailsService;
  let httpMock: HttpTestingController;
  let expectedResult: IUserDetails | IUserDetails[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(UserDetailsService);
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

    it('should create a UserDetails', () => {
      const userDetails = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(userDetails).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a UserDetails', () => {
      const userDetails = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(userDetails).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a UserDetails', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of UserDetails', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a UserDetails', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a UserDetails', () => {
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

    describe('addUserDetailsToCollectionIfMissing', () => {
      it('should add a UserDetails to an empty array', () => {
        const userDetails: IUserDetails = sampleWithRequiredData;
        expectedResult = service.addUserDetailsToCollectionIfMissing([], userDetails);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(userDetails);
      });

      it('should not add a UserDetails to an array that contains it', () => {
        const userDetails: IUserDetails = sampleWithRequiredData;
        const userDetailsCollection: IUserDetails[] = [
          {
            ...userDetails,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addUserDetailsToCollectionIfMissing(userDetailsCollection, userDetails);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a UserDetails to an array that doesn't contain it", () => {
        const userDetails: IUserDetails = sampleWithRequiredData;
        const userDetailsCollection: IUserDetails[] = [sampleWithPartialData];
        expectedResult = service.addUserDetailsToCollectionIfMissing(userDetailsCollection, userDetails);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userDetails);
      });

      it('should add only unique UserDetails to an array', () => {
        const userDetailsArray: IUserDetails[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const userDetailsCollection: IUserDetails[] = [sampleWithRequiredData];
        expectedResult = service.addUserDetailsToCollectionIfMissing(userDetailsCollection, ...userDetailsArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const userDetails: IUserDetails = sampleWithRequiredData;
        const userDetails2: IUserDetails = sampleWithPartialData;
        expectedResult = service.addUserDetailsToCollectionIfMissing([], userDetails, userDetails2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userDetails);
        expect(expectedResult).toContain(userDetails2);
      });

      it('should accept null and undefined values', () => {
        const userDetails: IUserDetails = sampleWithRequiredData;
        expectedResult = service.addUserDetailsToCollectionIfMissing([], null, userDetails, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(userDetails);
      });

      it('should return initial array if no UserDetails is added', () => {
        const userDetailsCollection: IUserDetails[] = [sampleWithRequiredData];
        expectedResult = service.addUserDetailsToCollectionIfMissing(userDetailsCollection, undefined, null);
        expect(expectedResult).toEqual(userDetailsCollection);
      });
    });

    describe('compareUserDetails', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareUserDetails(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = null;

        const compareResult1 = service.compareUserDetails(entity1, entity2);
        const compareResult2 = service.compareUserDetails(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'CBA' };

        const compareResult1 = service.compareUserDetails(entity1, entity2);
        const compareResult2 = service.compareUserDetails(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'ABC' };

        const compareResult1 = service.compareUserDetails(entity1, entity2);
        const compareResult2 = service.compareUserDetails(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
