import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Drawing } from '../../../../../common/communication/drawing';

/// Service permettant de faire la gestion de l'envois des dessins vers le
/// serveur.
@Injectable({
  providedIn: 'root',
})
export class DrawingRequestService {

  constructor(private http: HttpClient) { }

  /// Ajout d'un dessin sur le serveur
  addDrawing(drawing: Blob, name: string, tags: string[]): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('svg', drawing, 'file.svg');
    formData.append('name', name);
    formData.append('tags', JSON.stringify(tags));
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    const requestOptions = {
      headers,
    };
    return this.http.post<any>(environment.serverURL + '/drawings', formData, requestOptions);
  }

  /// Ouverture d'un dessin sur le serveur
  openDrawing(drawingPath: string): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Origin', 'localhost:4200');
    return this.http.get(drawingPath, { headers, responseType: 'text' as 'json' });
  }

  /// Retrait d'un dessin sur le serveur
  deleteDrawing(drawing: Drawing): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(environment.serverURL + '/drawings/' + drawing.fileName);
  }
}
