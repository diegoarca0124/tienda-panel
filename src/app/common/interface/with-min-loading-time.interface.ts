import { Observable, of, throwError } from 'rxjs';
import { finalize, delayWhen, delay, catchError, switchMap } from 'rxjs/operators';

export function withMinLoadingTime(minTime: number) {
  return (source$: Observable<any>) => {
    const startTime = Date.now();

    return source$.pipe(
      catchError(error => {
        // Si hay error, lo convertimos en un observable para poder aplicar el delay
        return of({ errorOccurred: true, error });
      }),
      delayWhen(() => {
        const elapsed = Date.now() - startTime;
        const delayNeeded = Math.max(0, minTime - elapsed);
        return delayNeeded > 0 ? of(null).pipe(delay(delayNeeded)) : of(null);
      }),
      switchMap(result => {
        if ((result as any).errorOccurred) {
          // Si era un error, volver a lanzar el error
          return throwError(() => (result as any).error);
        }
        // Si no era un error, devolver normalmente
        return of(result);
      })
    );
  };
}
