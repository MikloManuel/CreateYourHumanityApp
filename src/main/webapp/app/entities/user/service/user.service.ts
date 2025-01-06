import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError, tap } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Pagination, SearchWithPagination } from 'app/core/request/request.model';
import { IUser } from '../user.model';
import { IFriendrequest } from 'app/entities/friendrequest/friendrequest.model';

export type EntityResponseType = HttpResponse<IUser>;
export type EntityArrayResponseType = HttpResponse<IUser[]>;

@Injectable({ providedIn: 'root' })
export class UserService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/users');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/users/_search');
  protected loggedInUserUrl = this.applicationConfigService.getEndpointFor('api/users/loggedInUser');
  protected updateUserBioUrl = this.applicationConfigService.getEndpointFor('api/users/updateBio');

  updateUserBio(bio: string): Observable<IUser> {
    const user = this.http.get<IUser>(this.updateUserBioUrl, { params: { bio } });
    return user;
  }

  getAllUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.resourceUrl);
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IUser>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: Pagination): Observable<HttpResponse<IUser[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<IUser[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(tap(response => console.log('User query response:', response)));
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IUser[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IUser[]>()], asapScheduler)));
  }

  getLoggedInUser(): Observable<EntityResponseType> {
    return this.http.get<IUser>(this.loggedInUserUrl, { observe: 'response' });
  }

  getUserIdentifier(user: Pick<IUser, 'id'>): string {
    return user.id;
  }

  compareUser(o1: Pick<IUser, 'id'> | null, o2: Pick<IUser, 'id'> | null): boolean {
    return o1 && o2 ? this.getUserIdentifier(o1) === this.getUserIdentifier(o2) : o1 === o2;
  }

  addUserToCollectionIfMissing<Type extends Pick<IUser, 'id'>>(
    userCollection: Type[],
    ...usersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const users: Type[] = usersToCheck.filter(isPresent);
    if (users.length > 0) {
      const userCollectionIdentifiers = userCollection.map(userItem => this.getUserIdentifier(userItem));
      const usersToAdd = users.filter(userItem => {
        const userIdentifier = this.getUserIdentifier(userItem);
        if (userCollectionIdentifiers.includes(userIdentifier)) {
          return false;
        }
        userCollectionIdentifiers.push(userIdentifier);
        return true;
      });
      return [...usersToAdd, ...userCollection];
    }
    return userCollection;
  }

  sendFriendRequest(userId: string, senderLogin: string): Observable<HttpResponse<IUser>> {
    return this.http.post<IFriendrequest>(`${this.resourceUrl}/${userId}/friend-requests`, { senderLogin }, { observe: 'response' });
  }

  updateUserProfilePicture(userId: string, pictureUrl: string): Observable<EntityResponseType> {
    return this.http.put<IUser>(`${this.resourceUrl}/{userId}/picture`, { pictureUrl }, { observe: 'response' });
  }
}
