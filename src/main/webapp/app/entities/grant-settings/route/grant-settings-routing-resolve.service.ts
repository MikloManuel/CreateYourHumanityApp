import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IGrantSettings } from '../grant-settings.model';
import { GrantSettingsService } from '../service/grant-settings.service';

const grantSettingsResolve = (route: ActivatedRouteSnapshot): Observable<null | IGrantSettings> => {
  const id = route.params['id'];
  if (id) {
    return inject(GrantSettingsService)
      .find(id)
      .pipe(
        mergeMap((grantSettings: HttpResponse<IGrantSettings>) => {
          if (grantSettings.body) {
            return of(grantSettings.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default grantSettingsResolve;
