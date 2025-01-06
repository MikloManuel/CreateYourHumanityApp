import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IMindmapXml, NewMindmapXml } from '../mindmap-xml.model';

export type PartialUpdateMindmapXml = Partial<IMindmapXml> & Pick<IMindmapXml, 'id'>;

type RestOf<T extends IMindmapXml | NewMindmapXml> = Omit<T, 'modified'> & {
  modified?: string | null;
};

export type RestMindmapXml = RestOf<IMindmapXml>;

export type NewRestMindmapXml = RestOf<NewMindmapXml>;

export type PartialUpdateRestMindmapXml = RestOf<PartialUpdateMindmapXml>;

export type EntityResponseType = HttpResponse<IMindmapXml>;
export type EntityArrayResponseType = HttpResponse<IMindmapXml[]>;

@Injectable({ providedIn: 'root' })
export class MindmapXmlService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/mindmap-xmls');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/mindmap-xmls/_search');

  create(mindmapXml: NewMindmapXml): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(mindmapXml);
    return this.http
      .post<RestMindmapXml>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(mindmapXml: IMindmapXml): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(mindmapXml);
    return this.http
      .put<RestMindmapXml>(`${this.resourceUrl}/${this.getMindmapXmlIdentifier(mindmapXml)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(mindmapXml: PartialUpdateMindmapXml): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(mindmapXml);
    return this.http
      .patch<RestMindmapXml>(`${this.resourceUrl}/${this.getMindmapXmlIdentifier(mindmapXml)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestMindmapXml>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestMindmapXml[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestMindmapXml[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<IMindmapXml[]>()], asapScheduler)),
    );
  }

  getMindmapXmlIdentifier(mindmapXml: Pick<IMindmapXml, 'id'>): string {
    return mindmapXml.id;
  }

  compareMindmapXml(o1: Pick<IMindmapXml, 'id'> | null, o2: Pick<IMindmapXml, 'id'> | null): boolean {
    return o1 && o2 ? this.getMindmapXmlIdentifier(o1) === this.getMindmapXmlIdentifier(o2) : o1 === o2;
  }

  addMindmapXmlToCollectionIfMissing<Type extends Pick<IMindmapXml, 'id'>>(
    mindmapXmlCollection: Type[],
    ...mindmapXmlsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const mindmapXmls: Type[] = mindmapXmlsToCheck.filter(isPresent);
    if (mindmapXmls.length > 0) {
      const mindmapXmlCollectionIdentifiers = mindmapXmlCollection.map(mindmapXmlItem => this.getMindmapXmlIdentifier(mindmapXmlItem));
      const mindmapXmlsToAdd = mindmapXmls.filter(mindmapXmlItem => {
        const mindmapXmlIdentifier = this.getMindmapXmlIdentifier(mindmapXmlItem);
        if (mindmapXmlCollectionIdentifiers.includes(mindmapXmlIdentifier)) {
          return false;
        }
        mindmapXmlCollectionIdentifiers.push(mindmapXmlIdentifier);
        return true;
      });
      return [...mindmapXmlsToAdd, ...mindmapXmlCollection];
    }
    return mindmapXmlCollection;
  }

  protected convertDateFromClient<T extends IMindmapXml | NewMindmapXml | PartialUpdateMindmapXml>(mindmapXml: T): RestOf<T> {
    return {
      ...mindmapXml,
      modified: mindmapXml.modified?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restMindmapXml: RestMindmapXml): IMindmapXml {
    return {
      ...restMindmapXml,
      modified: restMindmapXml.modified ? dayjs(restMindmapXml.modified) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestMindmapXml>): HttpResponse<IMindmapXml> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestMindmapXml[]>): HttpResponse<IMindmapXml[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
