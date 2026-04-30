import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalLoaderService {
  private pending = 0;
  private _loading = new BehaviorSubject<boolean>(false);
  loading$ = this._loading.asObservable();

  start() {
    this.pending++;
    this._loading.next(true);
  }

  stop() {
    this.pending = Math.max(0, this.pending - 1);
    this._loading.next(this.pending > 0);
  }

  track<T>(obs$: Observable<T>) {
    this.start();
    return obs$.pipe(finalize(() => this.stop()));
  }
}
