import { IsInt, IsNotEmpty, IsString, IsUrl, Max, Min } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  readonly NODE_ENV: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  readonly HTTP_PORT: number;

  @IsString()
  @IsNotEmpty()
  readonly MENU_MICROSERVICE_GRPC_URL: string;

  @IsString()
  @IsNotEmpty()
  readonly USER_MICROSERVICE_GRPC_URL: string;

  @IsString()
  @IsNotEmpty()
  readonly MEDIA_MICROSERVICE_GRPC_URL: string;

  @IsString()
  @IsNotEmpty()
  readonly COOKIE_SECRET: string;

  @IsUrl({ require_tld: false }, { message: 'COOKIE_DOMAIN must be a valid URL' })
  @IsNotEmpty()
  readonly COOKIE_DOMAIN: string;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  readonly COOKIE_TTL: number;

  @IsString()
  @IsNotEmpty()
  readonly JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  readonly GOOGLE_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  readonly GOOGLE_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  readonly GOOGLE_OAUTH_STATE_SECRET: string;

  @IsUrl({ protocols: ['amqp', 'amqps'], require_tld: false }, { message: 'RABBITMQ_URL must be a valid AMQP URL' })
  @IsNotEmpty()
  readonly RABBITMQ_URL: string;

  @IsString()
  @IsNotEmpty()
  readonly RABBITMQ_QUEUE: string;

  @IsUrl({ require_tld: false }, { message: 'BACKEND_URL must be a valid URL' })
  @IsNotEmpty()
  readonly BACKEND_URL: string;

  @IsUrl({ require_tld: false }, { message: 'FRONTEND_URL must be a valid URL' })
  @IsNotEmpty()
  readonly FRONTEND_URL: string;
}
