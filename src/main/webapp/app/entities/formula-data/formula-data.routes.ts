import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { FormulaDataComponent } from './list/formula-data.component';
import { FormulaDataDetailComponent } from './detail/formula-data-detail.component';
import { FormulaDataUpdateComponent } from './update/formula-data-update.component';
import FormulaDataResolve from './route/formula-data-routing-resolve.service';

const formulaDataRoute: Routes = [
  {
    path: '',
    component: FormulaDataComponent,
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: FormulaDataDetailComponent,
    resolve: {
      formulaData: FormulaDataResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: FormulaDataUpdateComponent,
    resolve: {
      formulaData: FormulaDataResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: FormulaDataUpdateComponent,
    resolve: {
      formulaData: FormulaDataResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default formulaDataRoute;
