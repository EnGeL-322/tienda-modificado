import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: false
})
export class App {
  isAuthRoute = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Detectar si estamos en /auth/* para ocultar el layout
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        this.isAuthRoute = url.startsWith('/auth');
      });
  }

  // Nombre mostrado en el sidebar
  get displayUserName(): string {
    return this.authService.getCurrentUserName() ?? 'Usuario';
  }

  // Inicial para el avatar redondo
  get displayUserInitial(): string {
    return this.displayUserName.charAt(0).toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
