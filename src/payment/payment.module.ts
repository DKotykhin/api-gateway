import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.paymentClientOptions()])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
