import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';
import { environment } from 'src/environments/environment';
import { Drawing1 } from '../../../../../common/communication/new-drawing-parameters';

@Injectable({
  providedIn: 'root'
})
export class DrawingGalleryService {

  constructor(private http: HttpClient) { }

  /// Permet de recuperer les dessins sur le serveur
  getDrawings(): Observable<Drawing1[]> {
    return this.http.get<Drawing1[]>(environment.serverURL + '/api/gallery').pipe(
      catchError(() => of([])),
    );
  }
}
