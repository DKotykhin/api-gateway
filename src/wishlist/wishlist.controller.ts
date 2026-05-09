import { Body, Controller, Delete, Get, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Protected, UserId } from 'src/auth/decorators';
import type { CartResponse } from 'src/generated-types/cart';
import { AddToCartDto, RemoveFromCartDto } from 'src/cart/dto';
import { WishlistService } from './wishlist.service';

@ApiTags('wishlist')
@Protected()
@Controller('wishlist')
export class WishlistController {
  private readonly logger = new Logger(WishlistController.name);

  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get wishlist', description: 'Retrieves the wishlist for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns the wishlist for the authenticated user' })
  getWishlist(@UserId() userId: string): Observable<CartResponse> {
    this.logger.log(`Received request to get wishlist for userId: ${userId}`);
    return this.wishlistService.getWishlist(userId);
  }

  @Post('add')
  @ApiOperation({
    summary: 'Add item to wishlist',
    description: 'Adds an item to the wishlist of the authenticated user',
  })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, description: 'Returns the updated wishlist' })
  addToWishlist(@UserId() userId: string, @Body() data: AddToCartDto): Observable<CartResponse> {
    this.logger.log(`Received request to add item to wishlist for userId: ${userId}`);
    return this.wishlistService.addToWishlist(userId, data);
  }

  @Delete('remove')
  @ApiOperation({
    summary: 'Remove item from wishlist',
    description: 'Removes an item from the wishlist of the authenticated user',
  })
  @ApiBody({ type: RemoveFromCartDto })
  @ApiResponse({ status: 200, description: 'Returns the updated wishlist' })
  removeFromWishlist(@UserId() userId: string, @Body() data: RemoveFromCartDto): Observable<CartResponse> {
    this.logger.log(`Received request to remove item from wishlist for userId: ${userId}`);
    return this.wishlistService.removeFromWishlist(userId, data);
  }

  @Post('move-to-cart')
  @ApiOperation({ summary: 'Move item to cart', description: 'Moves an item from the wishlist to the cart' })
  @ApiBody({ type: RemoveFromCartDto })
  @ApiResponse({ status: 200, description: 'Returns the updated wishlist' })
  moveToCart(@UserId() userId: string, @Body() data: RemoveFromCartDto): Observable<CartResponse> {
    this.logger.log(`Received request to move item to cart for userId: ${userId}`);
    return this.wishlistService.moveToCart(userId, data);
  }

  @Post('move-to-wishlist')
  @ApiOperation({
    summary: 'Move item to wishlist',
    description: 'Moves an item from the cart to the wishlist',
  })
  @ApiBody({ type: RemoveFromCartDto })
  @ApiResponse({ status: 200, description: 'Returns the updated wishlist' })
  moveToWishlist(@UserId() userId: string, @Body() data: RemoveFromCartDto): Observable<CartResponse> {
    this.logger.log(`Received request to move item to wishlist for userId: ${userId}`);
    return this.wishlistService.moveToWishlist(userId, data);
  }
}
