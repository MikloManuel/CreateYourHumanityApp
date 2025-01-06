import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFriends } from '../friends.model';
import { FriendsService } from '../service/friends.service';

const friendsResolve = (route: ActivatedRouteSnapshot): Observable<null | IFriends> => {
  const id = route.params['id'];
  if (id) {
    return inject(FriendsService)
      .find(id)
      .pipe(
        mergeMap((friends: HttpResponse<IFriends>) => {
          if (friends.body) {
            return of(friends.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default friendsResolve;
