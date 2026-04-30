import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { HealthCheckModule } from './health-check/health-check.module';
import { MenuCategoryModule } from './menu-category/menu-category.module';
import { validateEnv } from './utils/env-validator';
import { EnvironmentVariables } from './common/dto';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MessageBrokerModule } from './transport/message-broker/message-broker.module';
import { MenuItemModule } from './menu-item/menu-item.module';
import { MetricsModule } from './supervision/metrics/metrics.module';
import { MediaModule } from './media/media.module';
import { StoreCategoryModule } from './store-category/store-category.module';
import { StoreAttributeModule } from './store-attribute/store-attribute.module';
import { StoreItemModule } from './store-item/store-item.module';
import { CircuitBreakerModule } from './supervision/circuit-breaker/circuit-breaker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
      validate: (config) => validateEnv(config, EnvironmentVariables),
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 10 * 1000, // 10 seconds
    }),
    HealthCheckModule,
    MessageBrokerModule,
    MenuCategoryModule,
    UserModule,
    AuthModule,
    MenuItemModule,
    MetricsModule,
    MediaModule,
    StoreCategoryModule,
    StoreAttributeModule,
    StoreItemModule,
    CircuitBreakerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
