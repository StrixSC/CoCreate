import { AuthService } from 'src/app/services/auth.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  email: string = "";
  isLoading: boolean = false;
  constructor(private snackbar: MatSnackBar, private auth: AuthService, public dialogRef: MatDialogRef<ForgotPasswordComponent>) { }

  async forgetPassword() {
    try {
      this.isLoading = true;
      await this.auth.forgetPassword(this.email);
      this.isLoading = false;
      this.dialogRef.close();
      this.snackbar.open("Un courriel vous à été envoyé, permettant de réinitialiser votre mot de passe! Suivez les étapes indiquées dans le courriel.", "OK", { duration: 5000 })
    } catch (e) {
      this.isLoading = false;
      this.snackbar.open("Une erreur est survenue lors du traitement de la requête...", "OK", { duration: 5000 })
    }

  }

}
