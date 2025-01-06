import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IUserMindmap } from '../user-mindmap.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../user-mindmap.test-samples';

import { UserMindmapService, RestUserMindmap } from './user-mindmap.service';

const requireRestSample: RestUserMindmap = {
  ...sampleWithRequiredData,
  modified: sampleWithRequiredData.modified?.toJSON(),
};

describe('UserMindmap Service', () => {
  let service: UserMindmapService;
  let httpMock: HttpTestingController;
  let expectedResult: IUserMindmap | IUserMindmap[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(UserMindmapService);
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

    it('should create a UserMindmap', () => {
      const userMindmap = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(userMindmap).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a UserMindmap', () => {
      const userMindmap = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(userMindmap).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a UserMindmap', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of UserMindmap', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a UserMindmap', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a UserMindmap', () => {
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

    describe('addUserMindmapToCollectionIfMissing', () => {
      it('should add a UserMindmap to an empty array', () => {
        const userMindmap: IUserMindmap = sampleWithRequiredData;
        expectedResult = service.addUserMindmapToCollectionIfMissing([], userMindmap);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(userMindmap);
      });

      it('should not add a UserMindmap to an array that contains it', () => {
        const userMindmap: IUserMindmap = sampleWithRequiredData;
        const userMindmapCollection: IUserMindmap[] = [
          {
            ...userMindmap,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addUserMindmapToCollectionIfMissing(userMindmapCollection, userMindmap);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a UserMindmap to an array that doesn't contain it", () => {
        const userMindmap: IUserMindmap = sampleWithRequiredData;
        const userMindmapCollection: IUserMindmap[] = [sampleWithPartialData];
        expectedResult = service.addUserMindmapToCollectionIfMissing(userMindmapCollection, userMindmap);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userMindmap);
      });

      it('should add only unique UserMindmap to an array', () => {
        const userMindmapArray: IUserMindmap[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const userMindmapCollection: IUserMindmap[] = [sampleWithRequiredData];
        expectedResult = service.addUserMindmapToCollectionIfMissing(userMindmapCollection, ...userMindmapArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const userMindmap: IUserMindmap = sampleWithRequiredData;
        const userMindmap2: IUserMindmap = sampleWithPartialData;
        expectedResult = service.addUserMindmapToCollectionIfMissing([], userMindmap, userMindmap2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userMindmap);
        expect(expectedResult).toContain(userMindmap2);
      });

      it('should accept null and undefined values', () => {
        const userMindmap: IUserMindmap = sampleWithRequiredData;
        expectedResult = service.addUserMindmapToCollectionIfMissing([], null, userMindmap, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(userMindmap);
      });

      it('should return initial array if no UserMindmap is added', () => {
        const userMindmapCollection: IUserMindmap[] = [sampleWithRequiredData];
        expectedResult = service.addUserMindmapToCollectionIfMissing(userMindmapCollection, undefined, null);
        expect(expectedResult).toEqual(userMindmapCollection);
      });
    });

    describe('compareUserMindmap', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareUserMindmap(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = null;

        const compareResult1 = service.compareUserMindmap(entity1, entity2);
        const compareResult2 = service.compareUserMindmap(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'CBA' };

        const compareResult1 = service.compareUserMindmap(entity1, entity2);
        const compareResult2 = service.compareUserMindmap(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'ABC' };

        const compareResult1 = service.compareUserMindmap(entity1, entity2);
        const compareResult2 = service.compareUserMindmap(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
