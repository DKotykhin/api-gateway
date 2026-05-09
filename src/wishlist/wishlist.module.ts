import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.cartClientOptions()])],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
