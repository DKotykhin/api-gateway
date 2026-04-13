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
  ) {}

  onModuleInit() {
    this.authService = this.authMicroserviceClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  signUp(data: SignUpRequest): Observable<User> {
    this.logger.log(`Signing up user with email: ${data.email}`);
    return this.authService
      .signUp(data)
      .pipe(
        this.metricsService.trackGrpcCall(TARGET_SERVICE, 'signUp'),
        this.metricsService.trackAuthAttempt('signup'),
      );
  }

  resendConfirmationEmail(email: string): Observable<StatusResponse> {
    this.logger.log(`Resending confirmation email to: ${email}`);
    return this.authService
      .resendConfirmationEmail({ email })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'resendConfirmationEmail'));
  }

  verifyEmail(token: string, clientInfo?: { ipAddress: string; userAgent: string }): Observable<AuthResponse> {
    this.logger.log(`Verifying email with token: ${token}`);
    return this.authService
      .verifyEmail({ token, clientInfo })
      .pipe(
        this.metricsService.trackGrpcCall(TARGET_SERVICE, 'verifyEmail'),
        this.metricsService.trackAuthAttempt('verify_email'),
      );
  }

  signIn(data: SignInRequest): Observable<AuthResponse> {
    this.logger.log(`Signing in user with email: ${data.email}`);
    return this.authService
      .signIn(data)
      .pipe(
        this.metricsService.trackGrpcCall(TARGET_SERVICE, 'signIn'),
        this.metricsService.trackAuthAttempt('signin'),
      );
  }

  refreshTokens(refreshToken: string): Observable<RefreshTokensResponse> {
    this.logger.log(`Refreshing tokens with refresh token: ${refreshToken.slice(0, 10)}...`);
    return this.authService
      .refreshTokens({ token: refreshToken })
      .pipe(
        this.metricsService.trackGrpcCall(TARGET_SERVICE, 'refreshTokens'),
        this.metricsService.trackAuthAttempt('refresh_tokens'),
      );
  }

  initResetPassword(email: string): Observable<StatusResponse> {
    this.logger.log(`Initiating reset password for email: ${email}`);
    return this.authService
      .initResetPassword({ email })
      .pipe(
        this.metricsService.trackGrpcCall(TARGET_SERVICE, 'initResetPassword'),
        this.metricsService.trackAuthAttempt('reset_password'),
      );
  }

  resendResetPasswordEmail(email: string): Observable<StatusResponse> {
    this.logger.log(`Resending reset password email to: ${email}`);
    return this.authService
      .resendResetPasswordEmail({ email })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'resendResetPasswordEmail'));
  }

  setNewPassword(token: string, password: string): Observable<StatusResponse> {
    this.logger.log(`Setting new password with token: ${token.slice(0, 10)}...`);
    return this.authService
      .setNewPassword({ token, password })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'setNewPassword'));
  }

  signOutCurrentDevice(userId: string, currentSessionId: string): Observable<StatusResponse> {
    this.logger.log(`Signing out current device with session ID: ${currentSessionId}`);
    return this.authService
      .signOutCurrentDevice({ userId, currentSessionId })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'signOutCurrentDevice'));
  }

  signOutOtherDevices(userId: string, currentSessionId: string): Observable<StatusResponse> {
    this.logger.log(`Signing out other devices for user ID: ${userId}, excluding session ID: ${currentSessionId}`);
    return this.authService
      .signOutOtherDevices({ userId, currentSessionId })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'signOutOtherDevices'));
  }

  signOutAllDevices(id: string): Observable<StatusResponse> {
    this.logger.log(`Signing out all devices for user ID: ${id}`);
    return this.authService
      .signOutAllDevices({ id })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'signOutAllDevices'));
  }

  oauthSignIn(data: OAuthSignInRequest): Observable<AuthResponse> {
    this.logger.log(`OAuth sign in for provider: ${data.provider}, providerId: ${data.providerId}`);
    return this.authService
      .oAuthSignIn(data)
      .pipe(
        this.metricsService.trackGrpcCall(TARGET_SERVICE, 'oAuthSignIn'),
        this.metricsService.trackAuthAttempt('oauth_signin'),
      );
  }
}
