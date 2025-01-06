import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { MindmapXmlComponent } from './list/mindmap-xml.component';
import { MindmapXmlDetailComponent } from './detail/mindmap-xml-detail.component';
import { MindmapXmlUpdateComponent } from './update/mindmap-xml-update.component';
import MindmapXmlResolve from './route/mindmap-xml-routing-resolve.service';

const mindmapXmlRoute: Routes = [
  {
    path: '',
    component: MindmapXmlComponent,
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: MindmapXmlDetailComponent,
    resolve: {
      mindmapXml: MindmapXmlResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: MindmapXmlUpdateComponent,
    resolve: {
      mindmapXml: MindmapXmlResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: MindmapXmlUpdateComponent,
    resolve: {
      mindmapXml: MindmapXmlResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default mindmapXmlRoute;
