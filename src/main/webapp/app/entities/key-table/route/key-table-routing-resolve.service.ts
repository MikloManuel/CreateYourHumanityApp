import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IKeyTable } from '../key-table.model';
import { KeyTableService } from '../service/key-table.service';

const keyTableResolve = (route: ActivatedRouteSnapshot): Observable<null | IKeyTable> => {
  const id = route.params['id'];
  if (id) {
    return inject(KeyTableService)
      .find(id)
      .pipe(
        mergeMap((keyTable: HttpResponse<IKeyTable>) => {
          if (keyTable.body) {
            return of(keyTable.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default keyTableResolve;
