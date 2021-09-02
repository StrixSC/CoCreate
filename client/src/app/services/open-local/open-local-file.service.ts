import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OpenLocalService {
  constructor(private reader: FileReader) { }

  handleFile(files: FileList): Observable<any> {

    const file = files[0];
    // Code fourni par  Anes Belfodil dans le cadre du cours de LOG2990
    return new Observable((subscriber) => {
      this.reader.onload = () => {
        this.handleReaderLoad(subscriber, this.reader.result as string);
      };
      this.reader.onerror = (error) => {
        this.handleReaderError(subscriber, error);
      };
      this.reader.readAsText(file);

    });
  }
  handleReaderLoad(subscriber: Subscriber<{}>, result: string): void {
    subscriber.next(result);
    subscriber.complete();
  }
  handleReaderError(subscriber: Subscriber<{}>, error: ProgressEvent): void {
    subscriber.error(error);
  }
}
