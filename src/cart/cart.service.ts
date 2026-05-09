import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  type AddToCartRequest,
  CART_SERVICE_NAME,
  type CartResponse,
  type CartServiceClient,
  type RemoveFromCartRequest,
  type StatusResponse,
  type UpdateCartItemRequest,
} from 'src/generated-types/cart';
import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { MetricsService } from 'src/supervision/metrics/metrics.service';
import type { AddToCartDto, RemoveFromCartDto, UpdateCartItemDto } from './dto';

const TARGET_SERVICE = 'order-microservice';

@Injectable()
export class CartService implements OnModuleInit {
  private cartService: CartServiceClient;
  private readonly logger = new Logger(CartService.name);

  constructor(
    @Inject('CART_CLIENT')
    private readonly cartMicroserviceClient: ClientGrpc,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.cartService = this.cartMicroserviceClient.getService<CartServiceClient>(CART_SERVICE_NAME);
  }

  private call<T>(source: Observable<T>, method: string): Observable<T> {
    return source.pipe(
      this.circuitBreaker.protect(TARGET_SERVICE),
      this.metricsService.trackGrpcCall(TARGET_SERVICE, method),
    );
  }

  getCart(userId: string): Observable<CartResponse> {
    this.logger.log(`Fetching cart for userId: ${userId}`);
    return this.call(this.cartService.getCart({ userId }), 'getCart');
  }

  addToCart(userId: string, item: AddToCartDto): Observable<CartResponse> {
    this.logger.log(`Adding item to cart for userId: ${userId}, productId: ${item.productId}`);
    return this.call(this.cartService.addToCart({ userId, item } as AddToCartRequest), 'addToCart');
  }

  updateCartItem(userId: string, item: UpdateCartItemDto): Observable<CartResponse> {
    this.logger.log(`Updating cart item for userId: ${userId}, productId: ${item.productId}`);
    return this.call(this.cartService.updateCartItem({ userId, item } as UpdateCartItemRequest), 'updateCartItem');
  }

  removeFromCart(userId: string, { productId, variantId }: RemoveFromCartDto): Observable<CartResponse> {
    this.logger.log(`Removing productId: ${productId} from cart for userId: ${userId}`);
    return this.call(
      this.cartService.removeFromCart({ userId, productId, variantId } as RemoveFromCartRequest),
      'removeFromCart',
    );
  }

  clearCart(userId: string): Observable<StatusResponse> {
    this.logger.log(`Clearing cart for userId: ${userId}`);
    return this.call(this.cartService.clearCart({ userId }), 'clearCart');
  }
}
