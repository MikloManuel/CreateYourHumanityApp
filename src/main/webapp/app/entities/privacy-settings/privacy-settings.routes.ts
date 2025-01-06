import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { PrivacySettingsComponent } from './list/privacy-settings.component';
import { PrivacySettingsDetailComponent } from './detail/privacy-settings-detail.component';
import { PrivacySettingsUpdateComponent } from './update/privacy-settings-update.component';
import PrivacySettingsResolve from './route/privacy-settings-routing-resolve.service';

const privacySettingsRoute: Routes = [
  {
    path: '',
    component: PrivacySettingsComponent,
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: PrivacySettingsDetailComponent,
    resolve: {
      privacySettings: PrivacySettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: PrivacySettingsUpdateComponent,
    resolve: {
      privacySettings: PrivacySettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: PrivacySettingsUpdateComponent,
    resolve: {
      privacySettings: PrivacySettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default privacySettingsRoute;
