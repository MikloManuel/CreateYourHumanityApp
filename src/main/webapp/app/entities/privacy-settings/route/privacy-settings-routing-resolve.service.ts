import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPrivacySettings } from '../privacy-settings.model';
import { PrivacySettingsService } from '../service/privacy-settings.service';

const privacySettingsResolve = (route: ActivatedRouteSnapshot): Observable<null | IPrivacySettings> => {
  const id = route.params['id'];
  if (id) {
    return inject(PrivacySettingsService)
      .find(id)
      .pipe(
        mergeMap((privacySettings: HttpResponse<IPrivacySettings>) => {
          if (privacySettings.body) {
            return of(privacySettings.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default privacySettingsResolve;
