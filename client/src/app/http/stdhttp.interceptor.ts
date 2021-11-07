import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()

export class StdHttpInterceptor implements HttpInterceptor {

    constructor(private auth: AngularFireAuth) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.auth.idToken.pipe(
            mergeMap((token: any) => {
                if (token) {
                    request = request.clone({ setHeaders: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
                }
                return next.handle(request);
            }));
    }
}
