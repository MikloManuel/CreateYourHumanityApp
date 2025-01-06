import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IMindmapXml } from '../mindmap-xml.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../mindmap-xml.test-samples';

import { MindmapXmlService, RestMindmapXml } from './mindmap-xml.service';

const requireRestSample: RestMindmapXml = {
  ...sampleWithRequiredData,
  modified: sampleWithRequiredData.modified?.toJSON(),
};

describe('MindmapXml Service', () => {
  let service: MindmapXmlService;
  let httpMock: HttpTestingController;
  let expectedResult: IMindmapXml | IMindmapXml[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(MindmapXmlService);
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

    it('should create a MindmapXml', () => {
      const mindmapXml = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(mindmapXml).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a MindmapXml', () => {
      const mindmapXml = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(mindmapXml).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a MindmapXml', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of MindmapXml', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a MindmapXml', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a MindmapXml', () => {
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

    describe('addMindmapXmlToCollectionIfMissing', () => {
      it('should add a MindmapXml to an empty array', () => {
        const mindmapXml: IMindmapXml = sampleWithRequiredData;
        expectedResult = service.addMindmapXmlToCollectionIfMissing([], mindmapXml);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(mindmapXml);
      });

      it('should not add a MindmapXml to an array that contains it', () => {
        const mindmapXml: IMindmapXml = sampleWithRequiredData;
        const mindmapXmlCollection: IMindmapXml[] = [
          {
            ...mindmapXml,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addMindmapXmlToCollectionIfMissing(mindmapXmlCollection, mindmapXml);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a MindmapXml to an array that doesn't contain it", () => {
        const mindmapXml: IMindmapXml = sampleWithRequiredData;
        const mindmapXmlCollection: IMindmapXml[] = [sampleWithPartialData];
        expectedResult = service.addMindmapXmlToCollectionIfMissing(mindmapXmlCollection, mindmapXml);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(mindmapXml);
      });

      it('should add only unique MindmapXml to an array', () => {
        const mindmapXmlArray: IMindmapXml[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const mindmapXmlCollection: IMindmapXml[] = [sampleWithRequiredData];
        expectedResult = service.addMindmapXmlToCollectionIfMissing(mindmapXmlCollection, ...mindmapXmlArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const mindmapXml: IMindmapXml = sampleWithRequiredData;
        const mindmapXml2: IMindmapXml = sampleWithPartialData;
        expectedResult = service.addMindmapXmlToCollectionIfMissing([], mindmapXml, mindmapXml2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(mindmapXml);
        expect(expectedResult).toContain(mindmapXml2);
      });

      it('should accept null and undefined values', () => {
        const mindmapXml: IMindmapXml = sampleWithRequiredData;
        expectedResult = service.addMindmapXmlToCollectionIfMissing([], null, mindmapXml, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(mindmapXml);
      });

      it('should return initial array if no MindmapXml is added', () => {
        const mindmapXmlCollection: IMindmapXml[] = [sampleWithRequiredData];
        expectedResult = service.addMindmapXmlToCollectionIfMissing(mindmapXmlCollection, undefined, null);
        expect(expectedResult).toEqual(mindmapXmlCollection);
      });
    });

    describe('compareMindmapXml', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareMindmapXml(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = null;

        const compareResult1 = service.compareMindmapXml(entity1, entity2);
        const compareResult2 = service.compareMindmapXml(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'CBA' };

        const compareResult1 = service.compareMindmapXml(entity1, entity2);
        const compareResult2 = service.compareMindmapXml(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'ABC' };
        const entity2 = { id: 'ABC' };

        const compareResult1 = service.compareMindmapXml(entity1, entity2);
        const compareResult2 = service.compareMindmapXml(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
