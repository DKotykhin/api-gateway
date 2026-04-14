import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, type StrategyOptions } from 'passport-google-oauth20';

import { HmacStateStore } from '../utils/hmac-state-store';

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
