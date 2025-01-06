import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IUserMindmap } from '../user-mindmap.model';
import { UserMindmapService } from '../service/user-mindmap.service';

const userMindmapResolve = (route: ActivatedRouteSnapshot): Observable<null | IUserMindmap> => {
  const id = route.params['id'];
  if (id) {
    return inject(UserMindmapService)
      .find(id)
      .pipe(
        mergeMap((userMindmap: HttpResponse<IUserMindmap>) => {
          if (userMindmap.body) {
            return of(userMindmap.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default userMindmapResolve;
