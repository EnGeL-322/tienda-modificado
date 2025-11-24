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
  // 🔹 NUEVO: obtener el userName desde el JWT
  getCurrentUserName(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payloadPart = parts[1];

      // Base64URL → Base64
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload: any = JSON.parse(jsonPayload);

      // Ajusta a cómo mandes el claim en el backend
      return payload.userName || payload.username || payload.sub || null;
    } catch (e) {
      console.error('Error decodificando token', e);
      return null;
    }
  }

}
