import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IKeyTable, NewKeyTable } from '../key-table.model';

export type PartialUpdateKeyTable = Partial<IKeyTable> & Pick<IKeyTable, 'id'>;

type RestOf<T extends IKeyTable | NewKeyTable> = Omit<T, 'created' | 'modified'> & {
  created?: string | null;
  modified?: string | null;
};

export type RestKeyTable = RestOf<IKeyTable>;

export type NewRestKeyTable = RestOf<NewKeyTable>;

export type PartialUpdateRestKeyTable = RestOf<PartialUpdateKeyTable>;

export type EntityResponseType = HttpResponse<IKeyTable>;
export type EntityArrayResponseType = HttpResponse<IKeyTable[]>;

@Injectable({ providedIn: 'root' })
export class KeyTableService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/key-tables');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/key-tables/_search');

  create(keyTable: NewKeyTable): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(keyTable);
    return this.http
      .post<RestKeyTable>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(keyTable: IKeyTable): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(keyTable);
    return this.http
      .put<RestKeyTable>(`${this.resourceUrl}/${this.getKeyTableIdentifier(keyTable)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(keyTable: PartialUpdateKeyTable): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(keyTable);
    return this.http
      .patch<RestKeyTable>(`${this.resourceUrl}/${this.getKeyTableIdentifier(keyTable)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestKeyTable>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestKeyTable[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestKeyTable[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<IKeyTable[]>()], asapScheduler)),
    );
  }

  getKeyTableIdentifier(keyTable: Pick<IKeyTable, 'id'>): string {
    return keyTable.id;
  }

  compareKeyTable(o1: Pick<IKeyTable, 'id'> | null, o2: Pick<IKeyTable, 'id'> | null): boolean {
    return o1 && o2 ? this.getKeyTableIdentifier(o1) === this.getKeyTableIdentifier(o2) : o1 === o2;
  }

  addKeyTableToCollectionIfMissing<Type extends Pick<IKeyTable, 'id'>>(
    keyTableCollection: Type[],
    ...keyTablesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const keyTables: Type[] = keyTablesToCheck.filter(isPresent);
    if (keyTables.length > 0) {
      const keyTableCollectionIdentifiers = keyTableCollection.map(keyTableItem => this.getKeyTableIdentifier(keyTableItem));
      const keyTablesToAdd = keyTables.filter(keyTableItem => {
        const keyTableIdentifier = this.getKeyTableIdentifier(keyTableItem);
        if (keyTableCollectionIdentifiers.includes(keyTableIdentifier)) {
          return false;
        }
        keyTableCollectionIdentifiers.push(keyTableIdentifier);
        return true;
      });
      return [...keyTablesToAdd, ...keyTableCollection];
    }
    return keyTableCollection;
  }

  protected convertDateFromClient<T extends IKeyTable | NewKeyTable | PartialUpdateKeyTable>(keyTable: T): RestOf<T> {
    return {
      ...keyTable,
      created: keyTable.created?.toJSON() ?? null,
      modified: keyTable.modified?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restKeyTable: RestKeyTable): IKeyTable {
    return {
      ...restKeyTable,
      created: restKeyTable.created ? dayjs(restKeyTable.created) : undefined,
      modified: restKeyTable.modified ? dayjs(restKeyTable.modified) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestKeyTable>): HttpResponse<IKeyTable> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestKeyTable[]>): HttpResponse<IKeyTable[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
