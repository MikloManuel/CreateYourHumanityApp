import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { UserMindmapComponent } from './list/user-mindmap.component';
import { UserMindmapDetailComponent } from './detail/user-mindmap-detail.component';
import { UserMindmapUpdateComponent } from './update/user-mindmap-update.component';
import UserMindmapResolve from './route/user-mindmap-routing-resolve.service';

const userMindmapRoute: Routes = [
  {
    path: '',
    component: UserMindmapComponent,
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: UserMindmapDetailComponent,
    resolve: {
      userMindmap: UserMindmapResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: UserMindmapUpdateComponent,
    resolve: {
      userMindmap: UserMindmapResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: UserMindmapUpdateComponent,
    resolve: {
      userMindmap: UserMindmapResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default userMindmapRoute;
