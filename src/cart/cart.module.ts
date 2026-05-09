import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.cartClientOptions()])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
