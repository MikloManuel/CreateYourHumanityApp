import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { FriendrequestComponent } from './list/friendrequest.component';
import { FriendrequestDetailComponent } from './detail/friendrequest-detail.component';
import { FriendrequestUpdateComponent } from './update/friendrequest-update.component';
import FriendrequestResolve from './route/friendrequest-routing-resolve.service';

const friendrequestRoute: Routes = [
  {
    path: '',
    component: FriendrequestComponent,
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: FriendrequestDetailComponent,
    resolve: {
      friendrequest: FriendrequestResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: FriendrequestUpdateComponent,
    resolve: {
      friendrequest: FriendrequestResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: FriendrequestUpdateComponent,
    resolve: {
      friendrequest: FriendrequestResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default friendrequestRoute;
