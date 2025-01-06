import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IFriendrequest, NewFriendrequest } from '../friendrequest.model';

export type PartialUpdateFriendrequest = Partial<IFriendrequest> & Pick<IFriendrequest, 'id'>;

type RestOf<T extends IFriendrequest | NewFriendrequest> = Omit<T, 'requestDate'> & {
  requestDate?: string | null;
};

export type RestFriendrequest = RestOf<IFriendrequest>;

export type NewRestFriendrequest = RestOf<NewFriendrequest>;

export type PartialUpdateRestFriendrequest = RestOf<PartialUpdateFriendrequest>;

export type EntityResponseType = HttpResponse<IFriendrequest>;
export type EntityArrayResponseType = HttpResponse<IFriendrequest[]>;

@Injectable({ providedIn: 'root' })
export class FriendrequestService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/friendrequests');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/friendrequests/_search');

  create(friendrequest: NewFriendrequest): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(friendrequest);
    return this.http
      .post<RestFriendrequest>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(friendrequest: IFriendrequest): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(friendrequest);
    return this.http
      .put<RestFriendrequest>(`${this.resourceUrl}/${this.getFriendrequestIdentifier(friendrequest)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(friendrequest: PartialUpdateFriendrequest): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(friendrequest);
    return this.http
      .patch<RestFriendrequest>(`${this.resourceUrl}/${this.getFriendrequestIdentifier(friendrequest)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestFriendrequest>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestFriendrequest[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestFriendrequest[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<IFriendrequest[]>()], asapScheduler)),
    );
  }

  getFriendrequestIdentifier(friendrequest: Pick<IFriendrequest, 'id'>): string {
    return friendrequest.id;
  }

  compareFriendrequest(o1: Pick<IFriendrequest, 'id'> | null, o2: Pick<IFriendrequest, 'id'> | null): boolean {
    return o1 && o2 ? this.getFriendrequestIdentifier(o1) === this.getFriendrequestIdentifier(o2) : o1 === o2;
  }

  addFriendrequestToCollectionIfMissing<Type extends Pick<IFriendrequest, 'id'>>(
    friendrequestCollection: Type[],
    ...friendrequestsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const friendrequests: Type[] = friendrequestsToCheck.filter(isPresent);
    if (friendrequests.length > 0) {
      const friendrequestCollectionIdentifiers = friendrequestCollection.map(friendrequestItem =>
        this.getFriendrequestIdentifier(friendrequestItem),
      );
      const friendrequestsToAdd = friendrequests.filter(friendrequestItem => {
        const friendrequestIdentifier = this.getFriendrequestIdentifier(friendrequestItem);
        if (friendrequestCollectionIdentifiers.includes(friendrequestIdentifier)) {
          return false;
        }
        friendrequestCollectionIdentifiers.push(friendrequestIdentifier);
        return true;
      });
      return [...friendrequestsToAdd, ...friendrequestCollection];
    }
    return friendrequestCollection;
  }

  protected convertDateFromClient<T extends IFriendrequest | NewFriendrequest | PartialUpdateFriendrequest>(friendrequest: T): RestOf<T> {
    return {
      ...friendrequest,
      requestDate: friendrequest.requestDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restFriendrequest: RestFriendrequest): IFriendrequest {
    return {
      ...restFriendrequest,
      requestDate: restFriendrequest.requestDate ? dayjs(restFriendrequest.requestDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestFriendrequest>): HttpResponse<IFriendrequest> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestFriendrequest[]>): HttpResponse<IFriendrequest[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
