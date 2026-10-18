import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import type { ApiEnvelope, ApiErrorBody } from './contracts';

/** Thrown for every non-2xx or `success: false` response so callers can catch one error type. */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    body: ApiErrorBody,
  ) {
    super(Array.isArray(body.message) ? body.message.join(' ') : body.message);
  }
}

/**
 * One HTTP client for every `<module>-api.service.ts` (plan: ADR-0001
 * §"frontend" folder shape) — unwraps the backend's single success/error
 * envelope so feature services never branch on it themselves, and always
 * sends cookies (the session lives in an httpOnly cookie, never a token
 * this app can read or store itself).
 */
@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  get<T>(path: string, headers?: Record<string, string>): Observable<T> {
    return this.request<T>('GET', path, undefined, headers);
  }

  post<T>(path: string, body?: unknown, headers?: Record<string, string>): Observable<T> {
    return this.request<T>('POST', path, body, headers);
  }

  patch<T>(path: string, body?: unknown, headers?: Record<string, string>): Observable<T> {
    return this.request<T>('PATCH', path, body, headers);
  }

  put<T>(path: string, body?: unknown, headers?: Record<string, string>): Observable<T> {
    return this.request<T>('PUT', path, body, headers);
  }

  delete<T>(path: string, headers?: Record<string, string>): Observable<T> {
    return this.request<T>('DELETE', path, undefined, headers);
  }

  private request<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Observable<T> {
    return this.http
      .request<ApiEnvelope<T> | T>(method, `${this.baseUrl}${path}`, {
        body,
        headers,
        withCredentials: true,
      })
      .pipe(
        map((response) => this.unwrap<T>(response)),
        catchError((error: HttpErrorResponse) => throwError(() => this.toApiError(error))),
      );
  }

  private unwrap<T>(response: ApiEnvelope<T> | T): T {
    if (response && typeof response === 'object' && 'success' in response) {
      const envelope = response as ApiEnvelope<T>;
      if (envelope.success) return envelope.data;
      throw new ApiError(envelope.error.statusCode ?? 0, envelope.error);
    }
    return response as T;
  }

  private toApiError(error: HttpErrorResponse): ApiError {
    const body = error.error as ApiEnvelope<unknown> | ApiErrorBody | undefined;
    if (body && typeof body === 'object' && 'success' in body && body.success === false) {
      return new ApiError(error.status, body.error);
    }
    if (body && typeof body === 'object' && 'message' in body) {
      return new ApiError(error.status, body as ApiErrorBody);
    }
    return new ApiError(error.status, { message: error.message || 'Something went wrong.' });
  }
}
