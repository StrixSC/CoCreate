import { AvatarDialogComponent } from './../avatar-dialog/avatar-dialog.component';
import { MatSnackBar, MatDialog, MatSnackBarConfig } from '@angular/material';
import { Subscription } from 'rxjs';
import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  options: MatSnackBarConfig = { duration: 5000, verticalPosition: 'top' };
  authSubscription: Subscription;
  isLoading: boolean = false;
  registerForm: FormGroup;
  activeFile: File | null = null;
  errorMessage: string | null = null;
  showPassword: boolean = false;
  selectedAvatarUrl: string | null = null;

  constructor(private dialog: MatDialog, private router: Router, private snackbar: MatSnackBar, private auth: AuthService, private fb: FormBuilder) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256)
      ]],
      username: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(256)
      ]],
      firstName: ['', [
        Validators.required
      ]],
      lastName: ['', [
        Validators.required
      ]],
    });
  }

  get email(): string {
    return this.registerForm.get('email')!.value;
  }

  get password(): string {
    return this.registerForm.get('password')!.value;
  }

  get username(): string {
    return this.registerForm.get('username')!.value;
  }

  get firstName(): string {
    return this.registerForm.get('firstName')!.value;
  }

  get lastName(): string {
    return this.registerForm.get('lastName')!.value;
  }

  register(): void {
    if (this.isValid()) {
      this.registerForm.disable();
      this.isLoading = true;
      const fd = new FormData();
      fd.append('username', this.username)
      fd.append('email', this.email)
      fd.append('password', this.password)
      fd.append('first_name', this.firstName)
      fd.append('last_name', this.lastName)

      if (this.activeFile) {
        fd.append('avatar', this.activeFile);
      } else if (this.selectedAvatarUrl && this.selectedAvatarUrl !== "") {
        fd.append('avatar_url', this.selectedAvatarUrl);
      } else {
        this.isLoading = false;
        this.registerForm.enable();
        this.snackbar.open('Le choix d\'un avatar est obligatoire');
        return;
      }

      this.authSubscription = this.auth.register(fd).subscribe(() => {
        this.snackbar.open('Votre compte a été crée avec succès! Connectez-vous!', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.router.navigateByUrl('auth/login');
        this.isLoading = false;
        this.errorMessage = "";
      }, (error) => {
        this.isLoading = false;
        this.registerForm.enable();
        this.snackbar.open(this.handleError(error), '', this.options);
      })
    } else {
      this.registerForm.markAsDirty();
      this.snackbar.open('Un ou plusieurs champs obligatoires n\'ont pas été complétés', '', this.options);
    }
  }

  uploadFile(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length >= 1) {
      const validImageTypes = ['image/jpeg', 'image/png'];
      if (!validImageTypes.includes(fileList[0].type)) {
        this.snackbar.open("Ce fichier n'est pas valid, SVP utilisez un fichier de format JPEG ou PNG", "", this.options)
        this.activeFile = null;
        return;
      } else {
        this.activeFile = fileList[0];
        this.selectedAvatarUrl = null;
      }
    }

  }

  isValid(): boolean {
    return this.registerForm.valid && (this.activeFile !== null || this.selectedAvatarUrl !== null);
  }

  ngOnDestroy(): void {
  }

  triggerAvatarDialog(): void {
    this.dialog.open(AvatarDialogComponent, {
      width: '750px',
      height: '500px',
    }).afterClosed().subscribe((data) => {
      if (data) {
        this.selectedAvatarUrl = data;
        this.activeFile = null;
      }
    })
  }

  handleError(error: HttpErrorResponse): string {
    if (error.status === 400) {
      return "Un ou plusieurs champs sont manquants ou invalids. Vérifiez que les champs sont bien tous remplis!"
    }
    if (error.status === 409) {
      return "Le courriel ou nom d'utilisateur sont déjà utilisés."
    }
    else return "Oups! Une erreur est survenue lors de la création du compte. SVP Réessayez à nouveau!"
  }
}
