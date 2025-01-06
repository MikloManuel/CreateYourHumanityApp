import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IGrantSettings, NewGrantSettings } from '../grant-settings.model';

export type PartialUpdateGrantSettings = Partial<IGrantSettings> & Pick<IGrantSettings, 'id'>;

export type EntityResponseType = HttpResponse<IGrantSettings>;
export type EntityArrayResponseType = HttpResponse<IGrantSettings[]>;

@Injectable({ providedIn: 'root' })
export class GrantSettingsService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/grant-settings');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/grant-settings/_search');

  create(grantSettings: NewGrantSettings): Observable<EntityResponseType> {
    return this.http.post<IGrantSettings>(this.resourceUrl, grantSettings, { observe: 'response' });
  }

  update(grantSettings: IGrantSettings): Observable<EntityResponseType> {
    return this.http.put<IGrantSettings>(`${this.resourceUrl}/${this.getGrantSettingsIdentifier(grantSettings)}`, grantSettings, {
      observe: 'response',
    });
  }

  partialUpdate(grantSettings: PartialUpdateGrantSettings): Observable<EntityResponseType> {
    return this.http.patch<IGrantSettings>(`${this.resourceUrl}/${this.getGrantSettingsIdentifier(grantSettings)}`, grantSettings, {
      observe: 'response',
    });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IGrantSettings>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IGrantSettings[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IGrantSettings[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IGrantSettings[]>()], asapScheduler)));
  }

  getGrantSettingsIdentifier(grantSettings: Pick<IGrantSettings, 'id'>): string {
    return grantSettings.id;
  }

  compareGrantSettings(o1: Pick<IGrantSettings, 'id'> | null, o2: Pick<IGrantSettings, 'id'> | null): boolean {
    return o1 && o2 ? this.getGrantSettingsIdentifier(o1) === this.getGrantSettingsIdentifier(o2) : o1 === o2;
  }

  addGrantSettingsToCollectionIfMissing<Type extends Pick<IGrantSettings, 'id'>>(
    grantSettingsCollection: Type[],
    ...grantSettingsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const grantSettings: Type[] = grantSettingsToCheck.filter(isPresent);
    if (grantSettings.length > 0) {
      const grantSettingsCollectionIdentifiers = grantSettingsCollection.map(grantSettingsItem =>
        this.getGrantSettingsIdentifier(grantSettingsItem),
      );
      const grantSettingsToAdd = grantSettings.filter(grantSettingsItem => {
        const grantSettingsIdentifier = this.getGrantSettingsIdentifier(grantSettingsItem);
        if (grantSettingsCollectionIdentifiers.includes(grantSettingsIdentifier)) {
          return false;
        }
        grantSettingsCollectionIdentifiers.push(grantSettingsIdentifier);
        return true;
      });
      return [...grantSettingsToAdd, ...grantSettingsCollection];
    }
    return grantSettingsCollection;
  }
}
