import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'createyourhumanityApp.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'mindmap-xml',
    data: { pageTitle: 'createyourhumanityApp.mindmapXml.home.title' },
    loadChildren: () => import('./mindmap-xml/mindmap-xml.routes'),
  },
  {
    path: 'formula-data',
    data: { pageTitle: 'createyourhumanityApp.formulaData.home.title' },
    loadChildren: () => import('./formula-data/formula-data.routes'),
  },
  {
    path: 'user-mindmap',
    data: { pageTitle: 'createyourhumanityApp.userMindmap.home.title' },
    loadChildren: () => import('./user-mindmap/user-mindmap.routes'),
  },
  {
    path: 'key-table',
    data: { pageTitle: 'createyourhumanityApp.keyTable.home.title' },
    loadChildren: () => import('./key-table/key-table.routes'),
  },
  {
    path: 'user-details',
    data: { pageTitle: 'createyourhumanityApp.userDetails.home.title' },
    loadChildren: () => import('./user-details/user-details.routes'),
  },
  {
    path: 'friends',
    data: { pageTitle: 'createyourhumanityApp.friends.home.title' },
    loadChildren: () => import('./friends/friends.routes'),
  },
  {
    path: 'friendrequest',
    data: { pageTitle: 'createyourhumanityApp.friendrequest.home.title' },
    loadChildren: () => import('./friendrequest/friendrequest.routes'),
  },
  {
    path: 'privacy-settings',
    data: { pageTitle: 'createyourhumanityApp.privacySettings.home.title' },
    loadChildren: () => import('./privacy-settings/privacy-settings.routes'),
  },
  {
    path: 'grant-settings',
    data: { pageTitle: 'createyourhumanityApp.grantSettings.home.title' },
    loadChildren: () => import('./grant-settings/grant-settings.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
