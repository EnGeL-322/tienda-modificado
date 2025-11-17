import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TokenDto {
  token: string;
}

export interface AuthUser {
  id?: number;
  userName: string;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
// SERVICIO DEL AUTH
export class AuthService {

  private readonly TOKEN_KEY = 'token';

  constructor(private http: HttpClient) {}

  // 🔹 LOGIN (igual que antes, guarda token)
  login(userName: string, password: string): Observable<TokenDto> {
    const url = `${environment.apiUrl}/auth/login`; // pasa por el gateway
    return this.http.post<TokenDto>(url, { userName, password }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
        }
      })
    );
  }

  // 🔹 CREAR USUARIO (para el modal de registro)
  createUser(userName: string, password: string): Observable<AuthUser> {
    const url = `${environment.apiUrl}/auth/create`;
    return this.http.post<AuthUser>(url, { userName, password });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
