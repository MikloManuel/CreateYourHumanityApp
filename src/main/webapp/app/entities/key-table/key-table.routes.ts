import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { KeyTableComponent } from './list/key-table.component';
import { KeyTableDetailComponent } from './detail/key-table-detail.component';
import { KeyTableUpdateComponent } from './update/key-table-update.component';
import KeyTableResolve from './route/key-table-routing-resolve.service';

const keyTableRoute: Routes = [
  {
    path: '',
    component: KeyTableComponent,
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: KeyTableDetailComponent,
    resolve: {
      keyTable: KeyTableResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: KeyTableUpdateComponent,
    resolve: {
      keyTable: KeyTableResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: KeyTableUpdateComponent,
    resolve: {
      keyTable: KeyTableResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default keyTableRoute;
