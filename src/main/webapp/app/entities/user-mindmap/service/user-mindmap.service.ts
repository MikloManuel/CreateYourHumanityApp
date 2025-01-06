import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IUserMindmap, NewUserMindmap } from '../user-mindmap.model';

export type PartialUpdateUserMindmap = Partial<IUserMindmap> & Pick<IUserMindmap, 'id'>;

type RestOf<T extends IUserMindmap | NewUserMindmap> = Omit<T, 'modified'> & {
  modified?: string | null;
};

export type RestUserMindmap = RestOf<IUserMindmap>;

export type NewRestUserMindmap = RestOf<NewUserMindmap>;

export type PartialUpdateRestUserMindmap = RestOf<PartialUpdateUserMindmap>;

export type EntityResponseType = HttpResponse<IUserMindmap>;
export type EntityArrayResponseType = HttpResponse<IUserMindmap[]>;

@Injectable({ providedIn: 'root' })
export class UserMindmapService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/user-mindmaps');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/user-mindmaps/_search');

  create(userMindmap: NewUserMindmap): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(userMindmap);
    return this.http
      .post<RestUserMindmap>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(userMindmap: IUserMindmap): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(userMindmap);
    return this.http
      .put<RestUserMindmap>(`${this.resourceUrl}/${this.getUserMindmapIdentifier(userMindmap)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(userMindmap: PartialUpdateUserMindmap): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(userMindmap);
    return this.http
      .patch<RestUserMindmap>(`${this.resourceUrl}/${this.getUserMindmapIdentifier(userMindmap)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestUserMindmap>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestUserMindmap[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestUserMindmap[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<IUserMindmap[]>()], asapScheduler)),
    );
  }

  getUserMindmapIdentifier(userMindmap: Pick<IUserMindmap, 'id'>): string {
    return userMindmap.id;
  }

  compareUserMindmap(o1: Pick<IUserMindmap, 'id'> | null, o2: Pick<IUserMindmap, 'id'> | null): boolean {
    return o1 && o2 ? this.getUserMindmapIdentifier(o1) === this.getUserMindmapIdentifier(o2) : o1 === o2;
  }

  addUserMindmapToCollectionIfMissing<Type extends Pick<IUserMindmap, 'id'>>(
    userMindmapCollection: Type[],
    ...userMindmapsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const userMindmaps: Type[] = userMindmapsToCheck.filter(isPresent);
    if (userMindmaps.length > 0) {
      const userMindmapCollectionIdentifiers = userMindmapCollection.map(userMindmapItem => this.getUserMindmapIdentifier(userMindmapItem));
      const userMindmapsToAdd = userMindmaps.filter(userMindmapItem => {
        const userMindmapIdentifier = this.getUserMindmapIdentifier(userMindmapItem);
        if (userMindmapCollectionIdentifiers.includes(userMindmapIdentifier)) {
          return false;
        }
        userMindmapCollectionIdentifiers.push(userMindmapIdentifier);
        return true;
      });
      return [...userMindmapsToAdd, ...userMindmapCollection];
    }
    return userMindmapCollection;
  }

  protected convertDateFromClient<T extends IUserMindmap | NewUserMindmap | PartialUpdateUserMindmap>(userMindmap: T): RestOf<T> {
    return {
      ...userMindmap,
      modified: userMindmap.modified?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restUserMindmap: RestUserMindmap): IUserMindmap {
    return {
      ...restUserMindmap,
      modified: restUserMindmap.modified ? dayjs(restUserMindmap.modified) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestUserMindmap>): HttpResponse<IUserMindmap> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestUserMindmap[]>): HttpResponse<IUserMindmap[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
