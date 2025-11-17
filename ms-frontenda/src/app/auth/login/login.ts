import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth';
import { AuthUser } from '../auth'; // si no lo exportas, quita esta línea

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  // LOGIN
  userName = '';
  password = '';
  loading = false;
  error: string | null = null;
  showPassword = false; // 👈 para el ojito del login

  // REGISTRO (modal)
  showRegister = false;
  regUserName = '';
  regPassword = '';
  regLoading = false;
  regError: string | null = null;
  regSuccess: string | null = null;
  showRegPassword = false; // 👈 para el ojito del registro

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // LOGIN
  onSubmit() {
    if (!this.userName || !this.password) {
      this.error = 'Ingrese usuario y contraseña';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.userName, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Usuario o contraseña incorrectos';
        console.error(err);
      }
    });
  }

  // TOGGLE ojito login
  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  // MODAL REGISTRO
  openRegister(): void {
    this.showRegister = true;
    this.regUserName = '';
    this.regPassword = '';
    this.regError = null;
    this.regSuccess = null;
  }

  closeRegister(): void {
    if (this.regLoading) return;
    this.showRegister = false;
  }

  onRegisterSubmit(): void {
    if (!this.regUserName || !this.regPassword) {
      this.regError = 'Ingrese usuario y contraseña';
      this.regSuccess = null;
      return;
    }

    this.regLoading = true;
    this.regError = null;
    this.regSuccess = null;

    this.authService.createUser(this.regUserName, this.regPassword).subscribe({
      next: () => {
        this.regLoading = false;
        this.regSuccess = 'Usuario creado correctamente';
      },
      error: (err) => {
        this.regLoading = false;
        this.regError = 'No se pudo crear el usuario';
        console.error(err);
      }
    });
  }

  // TOGGLE ojito registro
  toggleShowRegPassword(): void {
    this.showRegPassword = !this.showRegPassword;
  }
}
