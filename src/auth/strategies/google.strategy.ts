import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import * as crypto from 'crypto';
import { Profile, Strategy, type StrategyOptions } from 'passport-google-oauth20';
import type { Request } from 'express';

// Stateless CSRF state store — signs state with HMAC so no express-session is needed.
// Works across multiple api-gateway instances.
class HmacStateStore {
  private readonly secret: string;
  private readonly ttlSeconds: number;

  constructor(secret: string, ttlSeconds = 300) {
    this.secret = secret;
    this.ttlSeconds = ttlSeconds;
  }

  store(_req: Request, callback: (err: Error | null, state: string) => void): void {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const random = crypto.randomBytes(8).toString('hex');
    const payload = `${timestamp}.${random}`;
    const sig = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    callback(null, `${payload}.${sig}`);
  }

  verify(_req: Request, state: string, callback: (err: Error | null, ok: boolean, state?: string) => void): void {
    const parts = state.split('.');
    if (parts.length !== 3) {
      return callback(null, false);
    }
    const [timestamp, random, sig] = parts;
    const payload = `${timestamp}.${random}`;
    const expected = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');

    // Constant-time comparison to prevent timing attacks
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return callback(null, false);
    }

    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
    if (age > this.ttlSeconds) {
      return callback(null, false);
    }

    callback(null, true, state);
  }
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.getOrThrow<string>('BACKEND_URL')}/auth/google/callback`,
      scope: ['email', 'profile'],
      store: new HmacStateStore(configService.getOrThrow('GOOGLE_OAUTH_STATE_SECRET')),
    } as unknown as StrategyOptions);
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      provider: 'google' as const,
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
      accessToken,
      refreshToken: refreshToken ?? null,
    };
  }
}
