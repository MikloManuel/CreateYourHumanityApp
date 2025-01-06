import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IPrivacySettings } from '../privacy-settings.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../privacy-settings.test-samples';

import { PrivacySettingsService } from './privacy-settings.service';

const requireRestSample: IPrivacySettings = {
  ...sampleWithRequiredData,
};

describe('PrivacySettings Service', () => {
  let service: PrivacySettingsService;
  let httpMock: HttpTestingController;
  let expectedResult: IPrivacySettings | IPrivacySettings[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PrivacySettingsService);
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

    it('should create a PrivacySettings', () => {
      const privacySettings = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(privacySettings).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PrivacySettings', () => {
      const privacySettings = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(privacySettings).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PrivacySettings', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PrivacySettings', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PrivacySettings', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a PrivacySettings', () => {
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

    describe('addPrivacySettingsToCollectionIfMissing', () => {
      it('should add a PrivacySettings to an empty array', () => {
        const privacySettings: IPrivacySettings = sampleWithRequiredData;
        expectedResult = service.addPrivacySettingsToCollectionIfMissing([], privacySettings);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(privacySettings);
      });

      it('should not add a PrivacySettings to an array that contains it', () => {
        const privacySettings: IPrivacySettings = sampleWithRequiredData;
        const privacySettingsCollection: IPrivacySettings[] = [
          {
            ...privacySettings,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPrivacySettingsToCollectionIfMissing(privacySettingsCollection, privacySettings);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PrivacySettings to an array that doesn't contain it", () => {
        const privacySettings: IPrivacySettings = sampleWithRequiredData;
        const privacySettingsCollection: IPrivacySettings[] = [sampleWithPartialData];
        expectedResult = service.addPrivacySettingsToCollectionIfMissing(privacySettingsCollection, privacySettings);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(privacySettings);
      });

      it('should add only unique PrivacySettings to an array', () => {
        const privacySettingsArray: IPrivacySettings[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const privacySettingsCollection: IPrivacySettings[] = [sampleWithRequiredData];
        expectedResult = service.addPrivacySettingsToCollectionIfMissing(privacySettingsCollection, ...privacySettingsArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const privacySettings: IPrivacySettings = sampleWithRequiredData;
        const privacySettings2: IPrivacySettings = sampleWithPartialData;
        expectedResult = service.addPrivacySettingsToCollectionIfMissing([], privacySettings, privacySettings2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(privacySettings);
        expect(expectedResult).toContain(privacySettings2);
      });

      it('should accept null and undefined values', () => {
        const privacySettings: IPrivacySettings = sampleWithRequiredData;
        expectedResult = service.addPrivacySettingsToCollectionIfMissing([], null, privacySettings, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(privacySettings);
      });

      it('should return initial array if no PrivacySettings is added', () => {
        const privacySettingsCollection: IPrivacySettings[] = [sampleWithRequiredData];
        expectedResult = service.addPrivacySettingsToCollectionIfMissing(privacySettingsCollection, undefined, null);
        expect(expectedResult).toEqual(privacySettingsCollection);
      });
    });

    describe('comparePrivacySettings', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePrivacySettings(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = null;

        const compareResult1 = service.comparePrivacySettings(entity1, entity2);
        const compareResult2 = service.comparePrivacySettings(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'CBA' };

        const compareResult1 = service.comparePrivacySettings(entity1, entity2);
        const compareResult2 = service.comparePrivacySettings(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'ABC' };

        const compareResult1 = service.comparePrivacySettings(entity1, entity2);
        const compareResult2 = service.comparePrivacySettings(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
