import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { GrantSettingsComponent } from './list/grant-settings.component';
import { GrantSettingsDetailComponent } from './detail/grant-settings-detail.component';
import { GrantSettingsUpdateComponent } from './update/grant-settings-update.component';
import GrantSettingsResolve from './route/grant-settings-routing-resolve.service';

const grantSettingsRoute: Routes = [
  {
    path: '',
    component: GrantSettingsComponent,
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: GrantSettingsDetailComponent,
    resolve: {
      grantSettings: GrantSettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: GrantSettingsUpdateComponent,
    resolve: {
      grantSettings: GrantSettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: GrantSettingsUpdateComponent,
    resolve: {
      grantSettings: GrantSettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default grantSettingsRoute;
