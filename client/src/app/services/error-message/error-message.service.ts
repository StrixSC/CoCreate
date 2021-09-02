import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorMessageComponent } from 'src/app/components/error-message/error-message.component';
import { ErrorMessage } from 'src/app/model/error-message.model';

/// Permet la creation de message d'erreur personnalisé
@Injectable({
  providedIn: 'root',
})
export class ErrorMessageService {

  constructor(private dialog: MatDialog) { }

  /// Affiche un dialogue d'erreur avec un message d'erreur et de description
  showError(errorTitle: string, errorDescription: string): void {
    const error: ErrorMessage = { title: errorTitle, description: errorDescription };
    this.dialog.open(ErrorMessageComponent, { data: error });
  }
}
