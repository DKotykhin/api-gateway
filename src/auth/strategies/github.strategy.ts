import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, type StrategyOptions } from 'passport-github2';

import { HmacStateStore } from '../utils/hmac-state-store';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: `${configService.getOrThrow<string>('BACKEND_URL')}/auth/github/callback`,
      scope: ['user:email'],
      store: new HmacStateStore(configService.getOrThrow('GITHUB_OAUTH_STATE_SECRET')),
    } as unknown as StrategyOptions);
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    return {
      provider: 'github' as const,
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName ?? profile.username,
      avatarUrl: profile.photos?.[0]?.value ?? null,
      accessToken,
      refreshToken: refreshToken ?? null,
    };
  }
}
