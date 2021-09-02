import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ShortcutClavier, WelcomeMessage } from '../../../../../common/communication/message';

/// Service qui rassembler les getter des serveurs
@Injectable({
  providedIn: 'root',
})
export class IndexService {

  readonly BASE_URL: string = 'http://localhost:3000/api/index';

  constructor(private http: HttpClient) {
  }

  /// Transmet le message contenue dans le JSON file pour le message de bienvenue
  welcomeGet(): Observable<WelcomeMessage> {
    return this.http.get<WelcomeMessage>(environment.serverURL + '/index/text').pipe(
      catchError(this.handleError<WelcomeMessage>('welcomeGet',
        { body: 'Erreur de lecture serveur', end: 'Erreur de lecture serveur' })),
    );
  }

  /// Transmet le message contenue dans le JSON file pour le message de shortcut clavier
  aideGet(): Observable<ShortcutClavier> {
    return this.http.get<ShortcutClavier>(environment.serverURL + '/index/text').pipe(
      catchError(this.handleError<ShortcutClavier>('aideGet')),
    );
  }

  /// Gere les erreurs de l'index
  private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
    return (error: Error): Observable<T> => {
      return of(result as T);
    };
  }
}
