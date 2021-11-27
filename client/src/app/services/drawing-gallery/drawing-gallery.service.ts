import { HttpClient } from '@angular/common/http';
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
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery?offset=0').pipe(
      catchError(() => of([])),
    );
  }

  getMyDrawings(): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery/mine?offset=0').pipe(
      catchError(() => of([]))
    );
  }

  getTypeDrawings(offset: number, type?: string, filter?: string): Observable<IGalleryEntry[]> {
    if(isNaN(offset)) offset = 0;
    if(type !== 'All') {
      return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery?offset=${offset}&type=${type}`).pipe(
      catchError(() => of([])),
      );
    }
    else  {
        return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery?offset=${offset}`).pipe(
        catchError(() => of([])),
      );
    }
  }

  getTypeMyDrawings(offset: number, type?: string, filter?: string): Observable<IGalleryEntry[]> {
    if(isNaN(offset)) offset = 0;
    if(type !== "All" && !filter) {
      return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery/mine?offset=${offset}&type=${type}`).pipe(
        catchError(() => of([])),
      );
    }
    else if(type !== "All" && filter){
      return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery/mine?offset=${offset}&type=${type}&filter=${filter}`).pipe(
        catchError(() => of([])),
      );
    }
    else if (type === "All" && filter) {
      return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery/mine?offset=${offset}&filter=${filter}`).pipe(
        catchError(() => of([])),
      );
    }
    else {
      return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery/mine?offset=${offset}`).pipe(
        catchError(() => of([])),
      );
    }
  }

  filter(): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery').pipe(
      catchError(() => of([])),
    );
  }
}
