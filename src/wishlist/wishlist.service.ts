import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { type CartResponse, WISHLIST_SERVICE_NAME, type WishlistServiceClient } from 'src/generated-types/cart';
import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { MetricsService } from 'src/supervision/metrics/metrics.service';
import type { AddToCartDto, RemoveFromCartDto } from 'src/cart/dto';

const TARGET_SERVICE = 'order-microservice';

@Injectable()
export class WishlistService implements OnModuleInit {
  private wishlistService: WishlistServiceClient;
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    @Inject('CART_CLIENT')
    private readonly cartMicroserviceClient: ClientGrpc,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.wishlistService = this.cartMicroserviceClient.getService<WishlistServiceClient>(WISHLIST_SERVICE_NAME);
  }

  private call<T>(source: Observable<T>, method: string): Observable<T> {
    return source.pipe(
      this.circuitBreaker.protect(TARGET_SERVICE),
      this.metricsService.trackGrpcCall(TARGET_SERVICE, method),
    );
  }

  getWishlist(userId: string): Observable<CartResponse> {
    this.logger.log(`Fetching wishlist for userId: ${userId}`);
    return this.call(this.wishlistService.getWishlist({ userId }), 'getWishlist');
  }

  addToWishlist(userId: string, item: AddToCartDto): Observable<CartResponse> {
    this.logger.log(`Adding item to wishlist for userId: ${userId}, productId: ${item.productId}`);
    return this.call(this.wishlistService.addToWishlist({ userId, item }), 'addToWishlist');
  }

  removeFromWishlist(userId: string, { productId, variantId }: RemoveFromCartDto): Observable<CartResponse> {
    this.logger.log(`Removing productId: ${productId} from wishlist for userId: ${userId}`);
    return this.call(this.wishlistService.removeFromWishlist({ userId, productId, variantId }), 'removeFromWishlist');
  }

  moveToCart(userId: string, { productId, variantId }: RemoveFromCartDto): Observable<CartResponse> {
    this.logger.log(`Moving productId: ${productId} to cart for userId: ${userId}`);
    return this.call(this.wishlistService.moveToCart({ userId, productId, variantId }), 'moveToCart');
  }

  moveToWishlist(userId: string, { productId, variantId }: RemoveFromCartDto): Observable<CartResponse> {
    this.logger.log(`Moving productId: ${productId} to wishlist for userId: ${userId}`);
    return this.call(this.wishlistService.moveToWishlist({ userId, productId, variantId }), 'moveToWishlist');
  }
}
