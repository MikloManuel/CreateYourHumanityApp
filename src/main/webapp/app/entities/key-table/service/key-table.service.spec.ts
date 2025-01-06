import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IKeyTable } from '../key-table.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../key-table.test-samples';

import { KeyTableService, RestKeyTable } from './key-table.service';

const requireRestSample: RestKeyTable = {
  ...sampleWithRequiredData,
  created: sampleWithRequiredData.created?.toJSON(),
  modified: sampleWithRequiredData.modified?.toJSON(),
};

describe('KeyTable Service', () => {
  let service: KeyTableService;
  let httpMock: HttpTestingController;
  let expectedResult: IKeyTable | IKeyTable[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(KeyTableService);
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

    it('should create a KeyTable', () => {
      const keyTable = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(keyTable).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a KeyTable', () => {
      const keyTable = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(keyTable).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a KeyTable', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of KeyTable', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a KeyTable', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a KeyTable', () => {
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

    describe('addKeyTableToCollectionIfMissing', () => {
      it('should add a KeyTable to an empty array', () => {
        const keyTable: IKeyTable = sampleWithRequiredData;
        expectedResult = service.addKeyTableToCollectionIfMissing([], keyTable);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(keyTable);
      });

      it('should not add a KeyTable to an array that contains it', () => {
        const keyTable: IKeyTable = sampleWithRequiredData;
        const keyTableCollection: IKeyTable[] = [
          {
            ...keyTable,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addKeyTableToCollectionIfMissing(keyTableCollection, keyTable);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a KeyTable to an array that doesn't contain it", () => {
        const keyTable: IKeyTable = sampleWithRequiredData;
        const keyTableCollection: IKeyTable[] = [sampleWithPartialData];
        expectedResult = service.addKeyTableToCollectionIfMissing(keyTableCollection, keyTable);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(keyTable);
      });

      it('should add only unique KeyTable to an array', () => {
        const keyTableArray: IKeyTable[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const keyTableCollection: IKeyTable[] = [sampleWithRequiredData];
        expectedResult = service.addKeyTableToCollectionIfMissing(keyTableCollection, ...keyTableArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const keyTable: IKeyTable = sampleWithRequiredData;
        const keyTable2: IKeyTable = sampleWithPartialData;
        expectedResult = service.addKeyTableToCollectionIfMissing([], keyTable, keyTable2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(keyTable);
        expect(expectedResult).toContain(keyTable2);
      });

      it('should accept null and undefined values', () => {
        const keyTable: IKeyTable = sampleWithRequiredData;
        expectedResult = service.addKeyTableToCollectionIfMissing([], null, keyTable, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(keyTable);
      });

      it('should return initial array if no KeyTable is added', () => {
        const keyTableCollection: IKeyTable[] = [sampleWithRequiredData];
        expectedResult = service.addKeyTableToCollectionIfMissing(keyTableCollection, undefined, null);
        expect(expectedResult).toEqual(keyTableCollection);
      });
    });

    describe('compareKeyTable', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareKeyTable(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = null;

        const compareResult1 = service.compareKeyTable(entity1, entity2);
        const compareResult2 = service.compareKeyTable(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'CBA' };

        const compareResult1 = service.compareKeyTable(entity1, entity2);
        const compareResult2 = service.compareKeyTable(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'ABC' };

        const compareResult1 = service.compareKeyTable(entity1, entity2);
        const compareResult2 = service.compareKeyTable(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
