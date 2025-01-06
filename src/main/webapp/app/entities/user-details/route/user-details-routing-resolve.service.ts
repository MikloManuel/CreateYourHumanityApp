import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IUserDetails } from '../user-details.model';
import { UserDetailsService } from '../service/user-details.service';

const userDetailsResolve = (route: ActivatedRouteSnapshot): Observable<null | IUserDetails> => {
  const id = route.params['id'];
  if (id) {
    return inject(UserDetailsService)
      .find(id)
      .pipe(
        mergeMap((userDetails: HttpResponse<IUserDetails>) => {
          if (userDetails.body) {
            return of(userDetails.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default userDetailsResolve;
