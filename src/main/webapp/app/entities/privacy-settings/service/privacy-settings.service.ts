import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IPrivacySettings, NewPrivacySettings } from '../privacy-settings.model';

export type PartialUpdatePrivacySettings = Partial<IPrivacySettings> & Pick<IPrivacySettings, 'id'>;

export type EntityResponseType = HttpResponse<IPrivacySettings>;
export type EntityArrayResponseType = HttpResponse<IPrivacySettings[]>;

@Injectable({ providedIn: 'root' })
export class PrivacySettingsService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/privacy-settings');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/privacy-settings/_search');

  create(privacySettings: NewPrivacySettings): Observable<EntityResponseType> {
    return this.http.post<IPrivacySettings>(this.resourceUrl, privacySettings, { observe: 'response' });
  }

  update(privacySettings: IPrivacySettings): Observable<EntityResponseType> {
    return this.http.put<IPrivacySettings>(`${this.resourceUrl}/${this.getPrivacySettingsIdentifier(privacySettings)}`, privacySettings, {
      observe: 'response',
    });
  }

  partialUpdate(privacySettings: PartialUpdatePrivacySettings): Observable<EntityResponseType> {
    return this.http.patch<IPrivacySettings>(`${this.resourceUrl}/${this.getPrivacySettingsIdentifier(privacySettings)}`, privacySettings, {
      observe: 'response',
    });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IPrivacySettings>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPrivacySettings[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IPrivacySettings[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IPrivacySettings[]>()], asapScheduler)));
  }

  getPrivacySettingsIdentifier(privacySettings: Pick<IPrivacySettings, 'id'>): string {
    return privacySettings.id;
  }

  comparePrivacySettings(o1: Pick<IPrivacySettings, 'id'> | null, o2: Pick<IPrivacySettings, 'id'> | null): boolean {
    return o1 && o2 ? this.getPrivacySettingsIdentifier(o1) === this.getPrivacySettingsIdentifier(o2) : o1 === o2;
  }

  addPrivacySettingsToCollectionIfMissing<Type extends Pick<IPrivacySettings, 'id'>>(
    privacySettingsCollection: Type[],
    ...privacySettingsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const privacySettings: Type[] = privacySettingsToCheck.filter(isPresent);
    if (privacySettings.length > 0) {
      const privacySettingsCollectionIdentifiers = privacySettingsCollection.map(privacySettingsItem =>
        this.getPrivacySettingsIdentifier(privacySettingsItem),
      );
      const privacySettingsToAdd = privacySettings.filter(privacySettingsItem => {
        const privacySettingsIdentifier = this.getPrivacySettingsIdentifier(privacySettingsItem);
        if (privacySettingsCollectionIdentifiers.includes(privacySettingsIdentifier)) {
          return false;
        }
        privacySettingsCollectionIdentifiers.push(privacySettingsIdentifier);
        return true;
      });
      return [...privacySettingsToAdd, ...privacySettingsCollection];
    }
    return privacySettingsCollection;
  }
}
