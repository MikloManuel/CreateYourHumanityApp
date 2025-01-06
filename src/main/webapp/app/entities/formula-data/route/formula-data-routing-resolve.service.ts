import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFormulaData } from '../formula-data.model';
import { FormulaDataService } from '../service/formula-data.service';

const formulaDataResolve = (route: ActivatedRouteSnapshot): Observable<null | IFormulaData> => {
  const id = route.params['id'];
  if (id) {
    return inject(FormulaDataService)
      .find(id)
      .pipe(
        mergeMap((formulaData: HttpResponse<IFormulaData>) => {
          if (formulaData.body) {
            return of(formulaData.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default formulaDataResolve;
