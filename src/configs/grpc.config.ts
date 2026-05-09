import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { HEALTH_CHECK_V1_PACKAGE_NAME } from 'src/generated-types/health-check';
import { AUTH_V1_PACKAGE_NAME } from 'src/generated-types/auth';
import { USER_V1_PACKAGE_NAME } from 'src/generated-types/user';
import { MENU_CATEGORY_V1_PACKAGE_NAME } from 'src/generated-types/menu-category';
import { MENU_ITEM_V1_PACKAGE_NAME } from 'src/generated-types/menu-item';
import { MEDIA_V1_PACKAGE_NAME } from 'src/generated-types/media';
import { STORE_ATTRIBUTE_V1_PACKAGE_NAME } from 'src/generated-types/store-attribute';
import { STORE_CATEGORY_V1_PACKAGE_NAME } from 'src/generated-types/store-category';
import { STORE_ITEM_V1_PACKAGE_NAME } from 'src/generated-types/store-item';
import { CART_V1_PACKAGE_NAME } from 'src/generated-types/cart';
import { ORDER_V1_PACKAGE_NAME } from 'src/generated-types/order';
import { PAYMENT_V1_PACKAGE_NAME } from 'src/generated-types/payment';

export class GrpcConfig {
  static createGrpcClientOptions({
    serviceName,
    protoPath,
    packageName,
    urlConfigKey,
  }: {
    serviceName: string;
    protoPath: string | string[];
    packageName: string | string[];
    urlConfigKey: string;
  }): ClientsProviderAsyncOptions {
    return {
      name: serviceName,
      useFactory: (configService: ConfigService) => ({
        transport: Transport.GRPC,
        options: {
          url: configService.getOrThrow<string>(urlConfigKey),
          package: packageName,
          protoPath: protoPath,
        },
      }),
      inject: [ConfigService],
    };
  }

  static menuHealthCheckClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'MENU_HEALTH_CHECK_CLIENT',
      protoPath: 'proto/health-check.proto',
      packageName: HEALTH_CHECK_V1_PACKAGE_NAME,
      urlConfigKey: 'MENU_MICROSERVICE_GRPC_URL',
    });
  }

  static userHealthCheckClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'USER_HEALTH_CHECK_CLIENT',
      protoPath: 'proto/health-check.proto',
      packageName: HEALTH_CHECK_V1_PACKAGE_NAME,
      urlConfigKey: 'USER_MICROSERVICE_GRPC_URL',
    });
  }

  static mediaHealthCheckClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'MEDIA_HEALTH_CHECK_CLIENT',
      protoPath: 'proto/health-check.proto',
      packageName: HEALTH_CHECK_V1_PACKAGE_NAME,
      urlConfigKey: 'MEDIA_MICROSERVICE_GRPC_URL',
    });
  }

  static authClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'AUTH_CLIENT',
      protoPath: 'proto/auth.proto',
      packageName: AUTH_V1_PACKAGE_NAME,
      urlConfigKey: 'USER_MICROSERVICE_GRPC_URL',
    });
  }

  static menuCategoryClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'MENU_CATEGORY_CLIENT',
      protoPath: 'proto/menu-category.proto',
      packageName: MENU_CATEGORY_V1_PACKAGE_NAME,
      urlConfigKey: 'MENU_MICROSERVICE_GRPC_URL',
    });
  }

  static menuItemClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'MENU_ITEM_CLIENT',
      protoPath: 'proto/menu-item.proto',
      packageName: MENU_ITEM_V1_PACKAGE_NAME,
      urlConfigKey: 'MENU_MICROSERVICE_GRPC_URL',
    });
  }

  static userClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'USER_CLIENT',
      protoPath: 'proto/user.proto',
      packageName: USER_V1_PACKAGE_NAME,
      urlConfigKey: 'USER_MICROSERVICE_GRPC_URL',
    });
  }

  static mediaClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'MEDIA_CLIENT',
      protoPath: 'proto/media.proto',
      packageName: MEDIA_V1_PACKAGE_NAME,
      urlConfigKey: 'MEDIA_MICROSERVICE_GRPC_URL',
    });
  }

  static storeAttributeClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'STORE_ATTRIBUTE_CLIENT',
      protoPath: 'proto/store-attribute.proto',
      packageName: STORE_ATTRIBUTE_V1_PACKAGE_NAME,
      urlConfigKey: 'STORE_MICROSERVICE_GRPC_URL',
    });
  }

  static storeCategoryClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'STORE_CATEGORY_CLIENT',
      protoPath: 'proto/store-category.proto',
      packageName: STORE_CATEGORY_V1_PACKAGE_NAME,
      urlConfigKey: 'STORE_MICROSERVICE_GRPC_URL',
    });
  }

  static storeItemClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'STORE_ITEM_CLIENT',
      protoPath: 'proto/store-item.proto',
      packageName: STORE_ITEM_V1_PACKAGE_NAME,
      urlConfigKey: 'STORE_MICROSERVICE_GRPC_URL',
    });
  }

  static cartClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'CART_CLIENT',
      protoPath: 'proto/cart.proto',
      packageName: CART_V1_PACKAGE_NAME,
      urlConfigKey: 'ORDER_MICROSERVICE_GRPC_URL',
    });
  }

  static orderClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'ORDER_CLIENT',
      protoPath: 'proto/order.proto',
      packageName: ORDER_V1_PACKAGE_NAME,
      urlConfigKey: 'ORDER_MICROSERVICE_GRPC_URL',
    });
  }

  static paymentClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'PAYMENT_CLIENT',
      protoPath: 'proto/payment.proto',
      packageName: PAYMENT_V1_PACKAGE_NAME,
      urlConfigKey: 'PAYMENT_MICROSERVICE_GRPC_URL',
    });
  }
}
