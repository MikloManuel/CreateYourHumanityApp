import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { FriendsComponent } from './list/friends.component';
import { FriendsDetailComponent } from './detail/friends-detail.component';
import { FriendsUpdateComponent } from './update/friends-update.component';
import FriendsResolve from './route/friends-routing-resolve.service';

const friendsRoute: Routes = [
  {
    path: '',
    component: FriendsComponent,
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: FriendsDetailComponent,
    resolve: {
      friends: FriendsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: FriendsUpdateComponent,
    resolve: {
      friends: FriendsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: FriendsUpdateComponent,
    resolve: {
      friends: FriendsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default friendsRoute;
