import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IGrantSettings } from '../grant-settings.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../grant-settings.test-samples';

import { GrantSettingsService } from './grant-settings.service';

const requireRestSample: IGrantSettings = {
  ...sampleWithRequiredData,
};

describe('GrantSettings Service', () => {
  let service: GrantSettingsService;
  let httpMock: HttpTestingController;
  let expectedResult: IGrantSettings | IGrantSettings[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(GrantSettingsService);
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

    it('should create a GrantSettings', () => {
      const grantSettings = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(grantSettings).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a GrantSettings', () => {
      const grantSettings = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(grantSettings).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a GrantSettings', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of GrantSettings', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a GrantSettings', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a GrantSettings', () => {
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

    describe('addGrantSettingsToCollectionIfMissing', () => {
      it('should add a GrantSettings to an empty array', () => {
        const grantSettings: IGrantSettings = sampleWithRequiredData;
        expectedResult = service.addGrantSettingsToCollectionIfMissing([], grantSettings);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(grantSettings);
      });

      it('should not add a GrantSettings to an array that contains it', () => {
        const grantSettings: IGrantSettings = sampleWithRequiredData;
        const grantSettingsCollection: IGrantSettings[] = [
          {
            ...grantSettings,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addGrantSettingsToCollectionIfMissing(grantSettingsCollection, grantSettings);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a GrantSettings to an array that doesn't contain it", () => {
        const grantSettings: IGrantSettings = sampleWithRequiredData;
        const grantSettingsCollection: IGrantSettings[] = [sampleWithPartialData];
        expectedResult = service.addGrantSettingsToCollectionIfMissing(grantSettingsCollection, grantSettings);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(grantSettings);
      });

      it('should add only unique GrantSettings to an array', () => {
        const grantSettingsArray: IGrantSettings[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const grantSettingsCollection: IGrantSettings[] = [sampleWithRequiredData];
        expectedResult = service.addGrantSettingsToCollectionIfMissing(grantSettingsCollection, ...grantSettingsArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const grantSettings: IGrantSettings = sampleWithRequiredData;
        const grantSettings2: IGrantSettings = sampleWithPartialData;
        expectedResult = service.addGrantSettingsToCollectionIfMissing([], grantSettings, grantSettings2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(grantSettings);
        expect(expectedResult).toContain(grantSettings2);
      });

      it('should accept null and undefined values', () => {
        const grantSettings: IGrantSettings = sampleWithRequiredData;
        expectedResult = service.addGrantSettingsToCollectionIfMissing([], null, grantSettings, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(grantSettings);
      });

      it('should return initial array if no GrantSettings is added', () => {
        const grantSettingsCollection: IGrantSettings[] = [sampleWithRequiredData];
        expectedResult = service.addGrantSettingsToCollectionIfMissing(grantSettingsCollection, undefined, null);
        expect(expectedResult).toEqual(grantSettingsCollection);
      });
    });

    describe('compareGrantSettings', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareGrantSettings(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = null;

        const compareResult1 = service.compareGrantSettings(entity1, entity2);
        const compareResult2 = service.compareGrantSettings(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'CBA' };

        const compareResult1 = service.compareGrantSettings(entity1, entity2);
        const compareResult2 = service.compareGrantSettings(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'ABC' };

        const compareResult1 = service.compareGrantSettings(entity1, entity2);
        const compareResult2 = service.compareGrantSettings(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
