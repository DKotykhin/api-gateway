import { Body, Controller, Get, Logger, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Protected, UserId } from 'src/auth/decorators';
import { UserRole } from 'src/generated-types/user';
import type { OrderListResponse, OrderResponse } from 'src/generated-types/order';
import { GetOrdersQueryDto, UpdateOrderStatusDto } from './dto';
import { OrderService } from './order.service';

@ApiTags('order')
@Protected(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('order')
export class OrderAdminController {
  private readonly logger = new Logger(OrderAdminController.name);

  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders', description: 'Returns paginated list of all orders (admin only)' })
  @ApiResponse({ status: 200, description: 'Returns the list of all orders' })
  getAllOrders(@Query() query: GetOrdersQueryDto): Observable<OrderListResponse> {
    this.logger.log(`Received request to get all orders, page: ${query.page}, limit: ${query.limit}`);
    return this.orderService.getAllOrders(query);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status', description: 'Updates the status of an order (admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Returns the updated order' })
  updateOrderStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() userId: string,
    @Body() data: UpdateOrderStatusDto,
  ): Observable<OrderResponse> {
    this.logger.log(`Received request to update status of order id: ${id}`);
    return this.orderService.updateOrderStatus(id, userId, data);
  }
}
