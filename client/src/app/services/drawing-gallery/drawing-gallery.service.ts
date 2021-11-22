import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';
import { environment } from 'src/environments/environment';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';

@Injectable({
  providedIn: 'root'
})
export class DrawingGalleryService {

  constructor(private http: HttpClient) { }

  /// Permet de recuperer les dessins sur le serveur
  getDrawings(): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery').pipe(
      catchError(() => of([])),
    );
  }

  /*filter(offset: string, limit: string, filter?: string): Observable<IGalleryEntry[]> {
    //let params = new HttpParams().set('filter', param);
    let params = new HttpParams();
    params = params.append('offset', offset);
    params = params.append('limit', limit);
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery', {params: params}).pipe(
      catchError(() => of([])),
    );
  }*/
}
