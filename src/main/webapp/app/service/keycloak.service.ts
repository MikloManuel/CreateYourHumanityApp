import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private apiUrl = 'http://localhost:9001/api/keycloak';

  constructor(private http: HttpClient) {}

  getToken(): Observable<string> {
    return this.http.get(`${this.apiUrl}/token`, { responseType: 'text' });
  }
}
