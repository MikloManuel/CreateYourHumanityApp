import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IFormulaData } from '../formula-data.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../formula-data.test-samples';

import { FormulaDataService, RestFormulaData } from './formula-data.service';

const requireRestSample: RestFormulaData = {
  ...sampleWithRequiredData,
  created: sampleWithRequiredData.created?.toJSON(),
  modified: sampleWithRequiredData.modified?.toJSON(),
};

describe('FormulaData Service', () => {
  let service: FormulaDataService;
  let httpMock: HttpTestingController;
  let expectedResult: IFormulaData | IFormulaData[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(FormulaDataService);
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

    it('should create a FormulaData', () => {
      const formulaData = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(formulaData).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a FormulaData', () => {
      const formulaData = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(formulaData).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a FormulaData', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of FormulaData', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a FormulaData', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a FormulaData', () => {
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

    describe('addFormulaDataToCollectionIfMissing', () => {
      it('should add a FormulaData to an empty array', () => {
        const formulaData: IFormulaData = sampleWithRequiredData;
        expectedResult = service.addFormulaDataToCollectionIfMissing([], formulaData);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(formulaData);
      });

      it('should not add a FormulaData to an array that contains it', () => {
        const formulaData: IFormulaData = sampleWithRequiredData;
        const formulaDataCollection: IFormulaData[] = [
          {
            ...formulaData,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFormulaDataToCollectionIfMissing(formulaDataCollection, formulaData);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a FormulaData to an array that doesn't contain it", () => {
        const formulaData: IFormulaData = sampleWithRequiredData;
        const formulaDataCollection: IFormulaData[] = [sampleWithPartialData];
        expectedResult = service.addFormulaDataToCollectionIfMissing(formulaDataCollection, formulaData);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(formulaData);
      });

      it('should add only unique FormulaData to an array', () => {
        const formulaDataArray: IFormulaData[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const formulaDataCollection: IFormulaData[] = [sampleWithRequiredData];
        expectedResult = service.addFormulaDataToCollectionIfMissing(formulaDataCollection, ...formulaDataArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const formulaData: IFormulaData = sampleWithRequiredData;
        const formulaData2: IFormulaData = sampleWithPartialData;
        expectedResult = service.addFormulaDataToCollectionIfMissing([], formulaData, formulaData2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(formulaData);
        expect(expectedResult).toContain(formulaData2);
      });

      it('should accept null and undefined values', () => {
        const formulaData: IFormulaData = sampleWithRequiredData;
        expectedResult = service.addFormulaDataToCollectionIfMissing([], null, formulaData, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(formulaData);
      });

      it('should return initial array if no FormulaData is added', () => {
        const formulaDataCollection: IFormulaData[] = [sampleWithRequiredData];
        expectedResult = service.addFormulaDataToCollectionIfMissing(formulaDataCollection, undefined, null);
        expect(expectedResult).toEqual(formulaDataCollection);
      });
    });

    describe('compareFormulaData', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFormulaData(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = null;

        const compareResult1 = service.compareFormulaData(entity1, entity2);
        const compareResult2 = service.compareFormulaData(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'CBA' };

        const compareResult1 = service.compareFormulaData(entity1, entity2);
        const compareResult2 = service.compareFormulaData(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'ABC' };

        const compareResult1 = service.compareFormulaData(entity1, entity2);
        const compareResult2 = service.compareFormulaData(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
