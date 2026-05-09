import { Body, Controller, Get, Logger, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Protected, UserId } from 'src/auth/decorators';
import type { OrderListResponse, OrderResponse, OrderStatusHistoryResponse } from 'src/generated-types/order';
import { CreateOrderDto, GetOrdersQueryDto, RefundOrderDto } from './dto';
import { OrderService } from './order.service';

@ApiTags('order')
@Protected()
@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create order', description: 'Creates a new order for the authenticated user' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Returns the created order' })
  createOrder(@UserId() userId: string, @Body() data: CreateOrderDto): Observable<OrderResponse> {
    this.logger.log(`Received request to create order for userId: ${userId}`);
    return this.orderService.createOrder(userId, data);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my orders', description: 'Returns paginated order history for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns the list of orders for the authenticated user' })
  getOrdersByUser(@UserId() userId: string, @Query() query: GetOrdersQueryDto): Observable<OrderListResponse> {
    this.logger.log(`Received request to get orders for userId: ${userId}`);
    return this.orderService.getOrdersByUser(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID', description: 'Returns a single order by its ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns the order with the specified ID' })
  getOrder(@Param('id', new ParseUUIDPipe()) id: string): Observable<OrderResponse> {
    this.logger.log(`Received request to get order with id: ${id}`);
    return this.orderService.getOrder(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get order status history', description: 'Returns the status change history for an order' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns the status history for the specified order' })
  getOrderStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Observable<OrderStatusHistoryResponse> {
    this.logger.log(`Received request to get status history for order id: ${id}`);
    return this.orderService.getOrderStatusHistory(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order', description: 'Cancels a pending order belonging to the authenticated user' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns the cancelled order' })
  cancelOrder(@Param('id', new ParseUUIDPipe()) id: string, @UserId() userId: string): Observable<OrderResponse> {
    this.logger.log(`Received request to cancel order id: ${id} for userId: ${userId}`);
    return this.orderService.cancelOrder(id, userId);
  }

  @Post(':id/refund')
  @ApiOperation({
    summary: 'Refund order',
    description: 'Requests a refund for an order belonging to the authenticated user',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: RefundOrderDto })
  @ApiResponse({ status: 200, description: 'Returns the refunded order' })
  refundOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() userId: string,
    @Body() data: RefundOrderDto,
  ): Observable<OrderResponse> {
    this.logger.log(`Received request to refund order id: ${id} for userId: ${userId}`);
    return this.orderService.refundOrder(id, userId, data);
  }
}
