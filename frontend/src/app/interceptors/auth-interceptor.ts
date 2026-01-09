import { HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Read directly from storage
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(authReq);
};
