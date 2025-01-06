import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { KeycloakService } from './keycloak.service';

@Injectable({ providedIn: 'root' })
export class ProfilePictureService {
  private resourceUrl = '/api/profile-picture';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService,
  ) {}

  getProfilePictureUrl(id: string): Observable<any> {
    return this.http.get(`/api/profile-picture-url/${id}`, { responseType: 'text' });
  }

  getProfilePicture(id: string): Observable<any> {
    return this.http.put<any>(`${this.resourceUrl}/${id}`, {}).pipe(
      catchError(error => {
        console.error('Error fetching profile picture:', error);
        return throwError(error);
      }),
    );
  }

  async uploadProfilePicture(file: File, httpHeaders: HttpHeaders): Promise<Observable<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', 'heartfull-mind-ecosystems');
    formData.append('client_secret', 'qWpCrCctsonzUg34lrL8zncenniQW65Y');

    const token = await this.keycloakService.getToken().toPromise();
    httpHeaders = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded').set('Authorization', `Bearer ${token}`);

    return this.http.put<any>(`${this.resourceUrl}/upload-profile-picture`, formData, { headers: httpHeaders });
  }
}
