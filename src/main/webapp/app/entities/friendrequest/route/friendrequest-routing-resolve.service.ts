import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFriendrequest } from '../friendrequest.model';
import { FriendrequestService } from '../service/friendrequest.service';

const friendrequestResolve = (route: ActivatedRouteSnapshot): Observable<null | IFriendrequest> => {
  const id = route.params['id'];
  if (id) {
    return inject(FriendrequestService)
      .find(id)
      .pipe(
        mergeMap((friendrequest: HttpResponse<IFriendrequest>) => {
          if (friendrequest.body) {
            return of(friendrequest.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default friendrequestResolve;
