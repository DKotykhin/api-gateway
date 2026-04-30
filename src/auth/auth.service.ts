import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  AUTH_SERVICE_NAME,
  type AuthResponse,
  type AuthServiceClient,
  type OAuthSignInRequest,
  type RefreshTokensResponse,
  type SignInRequest,
  type SignUpRequest,
} from 'src/generated-types/auth';
import type { StatusResponse, User } from 'src/generated-types/user';
import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { MetricsService } from 'src/supervision/metrics/metrics.service';

const TARGET_SERVICE = 'user-microservice';

@Injectable()
export class AuthService implements OnModuleInit {
  private authService: AuthServiceClient;
  protected readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('AUTH_CLIENT')
    private readonly authMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  onModuleInit() {
    this.authService = this.authMicroserviceClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  private call<T>(source: Observable<T>, method: string): Observable<T> {
    return source.pipe(
      this.circuitBreaker.protect(TARGET_SERVICE),
      this.metricsService.trackGrpcCall(TARGET_SERVICE, method),
    );
  }

  signUp(data: SignUpRequest): Observable<User> {
    this.logger.log(`Signing up user with email: ${data.email}`);
    return this.call(this.authService.signUp(data), 'signUp').pipe(this.metricsService.trackAuthAttempt('signup'));
  }

  resendConfirmationEmail(email: string): Observable<StatusResponse> {
    this.logger.log(`Resending confirmation email to: ${email}`);
    return this.call(this.authService.resendConfirmationEmail({ email }), 'resendConfirmationEmail');
  }

  verifyEmail(token: string, clientInfo?: { ipAddress: string; userAgent: string }): Observable<AuthResponse> {
    this.logger.log(`Verifying email with token: ${token}`);
    return this.call(this.authService.verifyEmail({ token, clientInfo }), 'verifyEmail').pipe(
      this.metricsService.trackAuthAttempt('verify_email'),
    );
  }

  signIn(data: SignInRequest): Observable<AuthResponse> {
    this.logger.log(`Signing in user with email: ${data.email}`);
    return this.call(this.authService.signIn(data), 'signIn').pipe(this.metricsService.trackAuthAttempt('signin'));
  }

  refreshTokens(refreshToken: string): Observable<RefreshTokensResponse> {
    this.logger.log(`Refreshing tokens with refresh token: ${refreshToken.slice(0, 10)}...`);
    return this.call(this.authService.refreshTokens({ token: refreshToken }), 'refreshTokens').pipe(
      this.metricsService.trackAuthAttempt('refresh_tokens'),
    );
  }

  initResetPassword(email: string): Observable<StatusResponse> {
    this.logger.log(`Initiating reset password for email: ${email}`);
    return this.call(this.authService.initResetPassword({ email }), 'initResetPassword').pipe(
      this.metricsService.trackAuthAttempt('reset_password'),
    );
  }

  resendResetPasswordEmail(email: string): Observable<StatusResponse> {
    this.logger.log(`Resending reset password email to: ${email}`);
    return this.call(this.authService.resendResetPasswordEmail({ email }), 'resendResetPasswordEmail');
  }

  setNewPassword(token: string, password: string): Observable<StatusResponse> {
    this.logger.log(`Setting new password with token: ${token.slice(0, 10)}...`);
    return this.call(this.authService.setNewPassword({ token, password }), 'setNewPassword');
  }

  signOutCurrentDevice(userId: string, currentSessionId: string): Observable<StatusResponse> {
    this.logger.log(`Signing out current device with session ID: ${currentSessionId}`);
    return this.call(this.authService.signOutCurrentDevice({ userId, currentSessionId }), 'signOutCurrentDevice');
  }

  signOutOtherDevices(userId: string, currentSessionId: string): Observable<StatusResponse> {
    this.logger.log(`Signing out other devices for user ID: ${userId}, excluding session ID: ${currentSessionId}`);
    return this.call(this.authService.signOutOtherDevices({ userId, currentSessionId }), 'signOutOtherDevices');
  }

  signOutAllDevices(id: string): Observable<StatusResponse> {
    this.logger.log(`Signing out all devices for user ID: ${id}`);
    return this.call(this.authService.signOutAllDevices({ id }), 'signOutAllDevices');
  }

  oauthSignIn(data: OAuthSignInRequest): Observable<AuthResponse> {
    this.logger.log(`OAuth sign in for provider: ${data.provider}, providerId: ${data.providerId}`);
    return this.call(this.authService.oAuthSignIn(data), 'oAuthSignIn').pipe(
      this.metricsService.trackAuthAttempt('oauth_signin'),
    );
  }
}
