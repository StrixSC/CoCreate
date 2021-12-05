import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DrawingGalleryService {

  constructor(private http: HttpClient) { }

  filterDrawings(isMine: boolean, query: string) {
    return this.http.get(environment.serverURL + `/api/gallery${isMine ? "/mine" : ""}` + query);
  }

}
