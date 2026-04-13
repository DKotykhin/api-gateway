import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  AUTH_ATTEMPTS_TOTAL,
  ERRORS_TOTAL,
  GRPC_CLIENT_DURATION,
  GRPC_CLIENT_REQUESTS_TOTAL,
} from './metrics.constants';

export type GrpcStatus = 'success' | 'error';
export type ErrorType = 'grpc_error' | 'http_error' | 'validation_error' | 'auth_error' | 'internal_error';
export type AuthOperation = 'signup' | 'signin' | 'verify_email' | 'refresh_tokens' | 'reset_password' | 'oauth_signin';
export type AuthResult = 'success' | 'failure';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric(GRPC_CLIENT_DURATION)
    private readonly grpcClientDuration: Histogram<string>,
    @InjectMetric(GRPC_CLIENT_REQUESTS_TOTAL)
    private readonly grpcClientRequestsTotal: Counter<string>,
    @InjectMetric(ERRORS_TOTAL)
    private readonly errorsTotal: Counter<string>,
    @InjectMetric(AUTH_ATTEMPTS_TOTAL)
    private readonly authAttemptsTotal: Counter<string>,
  ) {}

  /**
   * Records gRPC client call metrics
   */
  recordGrpcCall(targetService: string, method: string, status: GrpcStatus, durationMs: number): void {
    const durationSeconds = durationMs / 1000;
    this.grpcClientDuration.observe({ target_service: targetService, method, status }, durationSeconds);
    this.grpcClientRequestsTotal.inc({ target_service: targetService, method, status });
  }

  /**
   * Records error metrics
   */
  recordError(errorType: ErrorType, source: string, statusCode: number | string): void {
    this.errorsTotal.inc({ error_type: errorType, source, status_code: String(statusCode) });
  }

  /**
   * Records authentication attempt metrics
   */
  recordAuthAttempt(operation: AuthOperation, result: AuthResult): void {
    this.authAttemptsTotal.inc({ operation, result });
  }

  /**
   * RxJS operator to wrap gRPC Observable calls with metrics tracking
   * Usage: return this.grpcService.someMethod(data).pipe(this.metricsService.trackGrpcCall('user-service', 'getUser'))
   */
  trackGrpcCall<T>(targetService: string, method: string): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>): Observable<T> => {
      const startTime = Date.now();

      return source.pipe(
        tap({
          next: () => {
            this.recordGrpcCall(targetService, method, 'success', Date.now() - startTime);
          },
        }),
        catchError((error: unknown) => {
          this.recordGrpcCall(targetService, method, 'error', Date.now() - startTime);
          return throwError(() => error);
        }),
      );
    };
  }

  /**
   * RxJS operator to wrap auth Observable calls with metrics tracking
   * Usage: return this.authService.signIn(data).pipe(this.metricsService.trackAuthAttempt('signin'))
   */
  trackAuthAttempt<T>(operation: AuthOperation): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>): Observable<T> => {
      return source.pipe(
        tap({
          next: () => {
            this.recordAuthAttempt(operation, 'success');
          },
        }),
        catchError((error: unknown) => {
          this.recordAuthAttempt(operation, 'failure');
          return throwError(() => error);
        }),
      );
    };
  }
}
