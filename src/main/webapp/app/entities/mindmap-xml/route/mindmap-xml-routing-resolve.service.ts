import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IMindmapXml } from '../mindmap-xml.model';
import { MindmapXmlService } from '../service/mindmap-xml.service';

const mindmapXmlResolve = (route: ActivatedRouteSnapshot): Observable<null | IMindmapXml> => {
  const id = route.params['id'];
  if (id) {
    return inject(MindmapXmlService)
      .find(id)
      .pipe(
        mergeMap((mindmapXml: HttpResponse<IMindmapXml>) => {
          if (mindmapXml.body) {
            return of(mindmapXml.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default mindmapXmlResolve;
