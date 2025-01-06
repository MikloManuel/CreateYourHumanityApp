import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IFriends, NewFriends } from '../friends.model';

export type PartialUpdateFriends = Partial<IFriends> & Pick<IFriends, 'id'>;

type RestOf<T extends IFriends | NewFriends> = Omit<T, 'connectDate'> & {
  connectDate?: string | null;
};

export type RestFriends = RestOf<IFriends>;

export type NewRestFriends = RestOf<NewFriends>;

export type PartialUpdateRestFriends = RestOf<PartialUpdateFriends>;

export type EntityResponseType = HttpResponse<IFriends>;
export type EntityArrayResponseType = HttpResponse<IFriends[]>;

@Injectable({ providedIn: 'root' })
export class FriendsService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/friends');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/friends/_search');

  create(friends: NewFriends): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(friends);
    return this.http
      .post<RestFriends>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(friends: IFriends): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(friends);
    return this.http
      .put<RestFriends>(`${this.resourceUrl}/${this.getFriendsIdentifier(friends)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(friends: PartialUpdateFriends): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(friends);
    return this.http
      .patch<RestFriends>(`${this.resourceUrl}/${this.getFriendsIdentifier(friends)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestFriends>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestFriends[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestFriends[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<IFriends[]>()], asapScheduler)),
    );
  }

  getFriendsIdentifier(friends: Pick<IFriends, 'id'>): string {
    return friends.id;
  }

  compareFriends(o1: Pick<IFriends, 'id'> | null, o2: Pick<IFriends, 'id'> | null): boolean {
    return o1 && o2 ? this.getFriendsIdentifier(o1) === this.getFriendsIdentifier(o2) : o1 === o2;
  }

  addFriendsToCollectionIfMissing<Type extends Pick<IFriends, 'id'>>(
    friendsCollection: Type[],
    ...friendsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const friends: Type[] = friendsToCheck.filter(isPresent);
    if (friends.length > 0) {
      const friendsCollectionIdentifiers = friendsCollection.map(friendsItem => this.getFriendsIdentifier(friendsItem));
      const friendsToAdd = friends.filter(friendsItem => {
        const friendsIdentifier = this.getFriendsIdentifier(friendsItem);
        if (friendsCollectionIdentifiers.includes(friendsIdentifier)) {
          return false;
        }
        friendsCollectionIdentifiers.push(friendsIdentifier);
        return true;
      });
      return [...friendsToAdd, ...friendsCollection];
    }
    return friendsCollection;
  }

  protected convertDateFromClient<T extends IFriends | NewFriends | PartialUpdateFriends>(friends: T): RestOf<T> {
    return {
      ...friends,
      connectDate: friends.connectDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restFriends: RestFriends): IFriends {
    return {
      ...restFriends,
      connectDate: restFriends.connectDate ? dayjs(restFriends.connectDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestFriends>): HttpResponse<IFriends> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestFriends[]>): HttpResponse<IFriends[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
