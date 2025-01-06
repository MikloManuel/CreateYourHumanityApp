import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IFormulaData, NewFormulaData } from '../formula-data.model';

export type PartialUpdateFormulaData = Partial<IFormulaData> & Pick<IFormulaData, 'id'>;

type RestOf<T extends IFormulaData | NewFormulaData> = Omit<T, 'created' | 'modified'> & {
  created?: string | null;
  modified?: string | null;
};

export type RestFormulaData = RestOf<IFormulaData>;

export type NewRestFormulaData = RestOf<NewFormulaData>;

export type PartialUpdateRestFormulaData = RestOf<PartialUpdateFormulaData>;

export type EntityResponseType = HttpResponse<IFormulaData>;
export type EntityArrayResponseType = HttpResponse<IFormulaData[]>;

@Injectable({ providedIn: 'root' })
export class FormulaDataService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/formula-data');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/formula-data/_search');

  create(formulaData: NewFormulaData): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(formulaData);
    return this.http
      .post<RestFormulaData>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(formulaData: IFormulaData): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(formulaData);
    return this.http
      .put<RestFormulaData>(`${this.resourceUrl}/${this.getFormulaDataIdentifier(formulaData)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(formulaData: PartialUpdateFormulaData): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(formulaData);
    return this.http
      .patch<RestFormulaData>(`${this.resourceUrl}/${this.getFormulaDataIdentifier(formulaData)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestFormulaData>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestFormulaData[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestFormulaData[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<IFormulaData[]>()], asapScheduler)),
    );
  }

  getFormulaDataIdentifier(formulaData: Pick<IFormulaData, 'id'>): string {
    return formulaData.id;
  }

  compareFormulaData(o1: Pick<IFormulaData, 'id'> | null, o2: Pick<IFormulaData, 'id'> | null): boolean {
    return o1 && o2 ? this.getFormulaDataIdentifier(o1) === this.getFormulaDataIdentifier(o2) : o1 === o2;
  }

  addFormulaDataToCollectionIfMissing<Type extends Pick<IFormulaData, 'id'>>(
    formulaDataCollection: Type[],
    ...formulaDataToCheck: (Type | null | undefined)[]
  ): Type[] {
    const formulaData: Type[] = formulaDataToCheck.filter(isPresent);
    if (formulaData.length > 0) {
      const formulaDataCollectionIdentifiers = formulaDataCollection.map(formulaDataItem => this.getFormulaDataIdentifier(formulaDataItem));
      const formulaDataToAdd = formulaData.filter(formulaDataItem => {
        const formulaDataIdentifier = this.getFormulaDataIdentifier(formulaDataItem);
        if (formulaDataCollectionIdentifiers.includes(formulaDataIdentifier)) {
          return false;
        }
        formulaDataCollectionIdentifiers.push(formulaDataIdentifier);
        return true;
      });
      return [...formulaDataToAdd, ...formulaDataCollection];
    }
    return formulaDataCollection;
  }

  protected convertDateFromClient<T extends IFormulaData | NewFormulaData | PartialUpdateFormulaData>(formulaData: T): RestOf<T> {
    return {
      ...formulaData,
      created: formulaData.created?.toJSON() ?? null,
      modified: formulaData.modified?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restFormulaData: RestFormulaData): IFormulaData {
    return {
      ...restFormulaData,
      created: restFormulaData.created ? dayjs(restFormulaData.created) : undefined,
      modified: restFormulaData.modified ? dayjs(restFormulaData.modified) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestFormulaData>): HttpResponse<IFormulaData> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestFormulaData[]>): HttpResponse<IFormulaData[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
