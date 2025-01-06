import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { UserDetailsComponent } from './list/user-details.component';
import { UserDetailsDetailComponent } from './detail/user-details-detail.component';
import { UserDetailsUpdateComponent } from './update/user-details-update.component';
import UserDetailsResolve from './route/user-details-routing-resolve.service';

const userDetailsRoute: Routes = [
  {
    path: '',
    component: UserDetailsComponent,
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: UserDetailsDetailComponent,
    resolve: {
      userDetails: UserDetailsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: UserDetailsUpdateComponent,
    resolve: {
      userDetails: UserDetailsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: UserDetailsUpdateComponent,
    resolve: {
      userDetails: UserDetailsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default userDetailsRoute;
