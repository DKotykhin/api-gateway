import { Body, Controller, Delete, Get, Logger, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Protected, UserId } from 'src/auth/decorators';
import type { CartResponse, StatusResponse } from 'src/generated-types/cart';
import { AddToCartDto, RemoveFromCartDto, UpdateCartItemDto } from './dto';
import { CartService } from './cart.service';

@ApiTags('cart')
@Protected()
@Controller('cart')
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart', description: 'Retrieves the cart for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns the cart for the authenticated user' })
  getCart(@UserId() userId: string): Observable<CartResponse> {
    this.logger.log(`Received request to get cart for userId: ${userId}`);
    return this.cartService.getCart(userId);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add item to cart', description: 'Adds an item to the cart of the authenticated user' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, description: 'Returns the updated cart' })
  addToCart(@UserId() userId: string, @Body() data: AddToCartDto): Observable<CartResponse> {
    this.logger.log(`Received request to add item to cart for userId: ${userId}`);
    return this.cartService.addToCart(userId, data);
  }

  @Patch('update')
  @ApiOperation({ summary: 'Update cart item', description: 'Updates the quantity of an item in the cart' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Returns the updated cart' })
  updateCartItem(@UserId() userId: string, @Body() data: UpdateCartItemDto): Observable<CartResponse> {
    this.logger.log(`Received request to update cart item for userId: ${userId}`);
    return this.cartService.updateCartItem(userId, data);
  }

  @Delete('remove')
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Removes an item from the cart of the authenticated user',
  })
  @ApiBody({ type: RemoveFromCartDto })
  @ApiResponse({ status: 200, description: 'Returns the updated cart' })
  removeFromCart(@UserId() userId: string, @Body() data: RemoveFromCartDto): Observable<CartResponse> {
    this.logger.log(`Received request to remove item from cart for userId: ${userId}`);
    return this.cartService.removeFromCart(userId, data);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear cart', description: 'Removes all items from the cart of the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns the status of the clear operation' })
  clearCart(@UserId() userId: string): Observable<StatusResponse> {
    this.logger.log(`Received request to clear cart for userId: ${userId}`);
    return this.cartService.clearCart(userId);
  }
}
