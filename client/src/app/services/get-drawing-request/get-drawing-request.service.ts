import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Drawing } from '../../../../../common/communication/drawing';

/// Service qui effectue la gestion de la recuperatio des dessins sur le serveur
@Injectable({
  providedIn: 'root',
})
export class GetDrawingRequestService {

  constructor(private http: HttpClient) { }

  /// Permet de recuperer les dessins sur le serveur
  getDrawings(): Observable<Drawing[]> {
    return this.http.get<Drawing[]>(environment.serverURL + '/drawings/').pipe(
      catchError(() => of([])),
    );
  }

}
