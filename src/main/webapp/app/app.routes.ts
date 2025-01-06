import { LoadChildren, Routes } from '@angular/router';

import { Authority } from 'app/config/authority.constants';
import { loadRemoteModule } from '@angular-architects/module-federation';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { errorRoute } from './layouts/error/error.route';
import { SettingsComponent } from './settings/settings.component';

const sendButtonModule: LoadChildren = () =>
  loadRemoteModule({
    type: 'module',
    remoteEntry: 'http://localhost:4040/remoteEntry.js',
    exposedModule: './SendRequestButtonComponent',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  }).then(m => m.SendRequestButtonComponent);

const routes: Routes = [
  {
    path: 'send-button',
    loadChildren: sendButtonModule,
  },
  {
    path: 'user-list',
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent),
    title: 'User List',
  },
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    title: 'home.title',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar.component').then(m => m.NavbarComponent),
    outlet: 'navbar',
  },
  {
    path: 'admin',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
    loadChildren: () => import('./admin/admin.routes').then(m => m.default),
  },
  {
    path: '',
    loadChildren: () => import(`./entities/entity.routes`).then(m => m.default),
  },
  ...errorRoute,
];

export default routes;
