import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderAdminController } from './order-admin.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.orderClientOptions()])],
  controllers: [OrderController, OrderAdminController],
  providers: [OrderService],
})
export class OrderModule {}
