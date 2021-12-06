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

    constructor(private auth: AngularFireAuth) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.auth.idToken.pipe(
            mergeMap((token: any) => {
                if (token) {
                    let headers = {
                        Authorization: `Bearer ${token}`
                    } as any;

                    request = request.clone({ setHeaders: headers });
                    console.log(request.headers);
                }
                return next.handle(request);
            }));
    }
}
