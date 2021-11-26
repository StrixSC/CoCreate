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
  getPrivateDrawings(): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery?type=Private',).pipe(
      catchError(() => of([])),
    );
  }
  getPublicDrawings(): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery',).pipe(
      catchError(() => of([])),
    );
  }
  getProtectedDrawings(): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery?type=Protected',).pipe(
      catchError(() => of([])),
    );
  }
  getDrawings(): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery?offset=0').pipe(
      catchError(() => of([])),
    );
  }
  getNextDrawings(offset: number): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery?offset=${offset}`).pipe(
      catchError(() => of([])),
    );
  }

  getTypeDrawings(offset: number, type?: string): Observable<IGalleryEntry[]> {
    if(offset === undefined) offset = 0;
    if(type !== 'All') {
      return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery?offset=${offset}?type=${type}`).pipe(
      catchError(() => of([])),
      );
    }
    else  {
        return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery?offset=${offset}`).pipe(
        catchError(() => of([])),
      );
    }
  }

  getTypeMyDrawings(offset: number, type?: string): Observable<IGalleryEntry[]> {
    if(isNaN(offset)) offset = 0;
    if(type !== "All" ) {
      return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery/mine?offset=${offset}&type=${type}`).pipe(
        catchError(() => of([])),
      );
    }
    else {
      return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery/mine?offset=${offset}`).pipe(
        catchError(() => of([])),
      );
    }
  }

  getMyDrawings(): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery/mine?offset=0').pipe(
      catchError(() => of([]))
    );
  }

  getNextMyDrawings(offset: number): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + `/api/gallery/mine?offset=${offset}`).pipe(
      catchError(() => of([])),
    );
  }

  filter(): Observable<IGalleryEntry[]> {
    return this.http.get<IGalleryEntry[]>(environment.serverURL + '/api/gallery').pipe(
      catchError(() => of([])),
    );
  }
}
