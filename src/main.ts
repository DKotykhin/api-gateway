import { config } from 'dotenv';
config({ path: '.env.local' });

import { initTracing } from './supervision/tracing/tracing';

// Initialize tracing BEFORE any other imports to ensure proper instrumentation
initTracing();

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as (secret?: string) => unknown;

const logger = new Logger('Main');

async function loadSecretsFromVault(): Promise<void> {
  const vaultApiPath = process.env.VAULT_API_PATH;
  const vaultToken = process.env.VAULT_TOKEN;
  logger.log(`Attempting to load secrets from ${vaultApiPath} with token ${vaultToken ? '***' : '(unspecified)'}`);

  if (!vaultApiPath || !vaultToken) {
    logger.warn('VAULT_API_PATH or VAULT_TOKEN not set — skipping, using local env');
    return;
  }

  try {
    const response = await fetch(vaultApiPath, { headers: { 'X-Vault-Token': vaultToken } });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const json = (await response.json()) as { data: { data: Record<string, string> } };
    const secrets = json.data.data;
    Object.assign(process.env, secrets);
    logger.log(`Loaded ${Object.keys(secrets).length} secrets from ${vaultApiPath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[Vault] Failed to load secrets from "${vaultApiPath}": ${errorMessage}`);
    throw new Error(`[Vault] Failed to load secrets from "${vaultApiPath}": ${errorMessage}`);
  }
}

async function bootstrap() {
  await loadSecretsFromVault();
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error'] : ['log', 'debug', 'warn', 'error', 'verbose'],
  });
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>('HTTP_PORT');

  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // GrpcExceptionFilter is now provided globally via APP_FILTER in MetricsModule

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
    methods: (configService.get<string>('CORS_METHODS') || '').split(','),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API for CoffeeDoor Gateway Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT || 4000);
  logger.log(`API Gateway service is running on ${PORT || 4000}`);
}
void bootstrap();
