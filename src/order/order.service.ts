import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  ORDER_SERVICE_NAME,
  type OrderListResponse,
  type OrderResponse,
  type OrderServiceClient,
  type OrderStatusHistoryResponse,
} from 'src/generated-types/order';
import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { MetricsService } from 'src/supervision/metrics/metrics.service';
import type { CreateOrderDto, GetOrdersQueryDto, RefundOrderDto, UpdateOrderStatusDto } from './dto';

const TARGET_SERVICE = 'order-microservice';

@Injectable()
export class OrderService implements OnModuleInit {
  private orderService: OrderServiceClient;
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject('ORDER_CLIENT')
    private readonly orderMicroserviceClient: ClientGrpc,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.orderService = this.orderMicroserviceClient.getService<OrderServiceClient>(ORDER_SERVICE_NAME);
  }

  private call<T>(source: Observable<T>, method: string): Observable<T> {
    return source.pipe(
      this.circuitBreaker.protect(TARGET_SERVICE),
      this.metricsService.trackGrpcCall(TARGET_SERVICE, method),
    );
  }

  createOrder(userId: string, { items, notes, idempotencyKey }: CreateOrderDto): Observable<OrderResponse> {
    this.logger.log(`Creating order for userId: ${userId}, items: ${items.length}`);
    return this.call(this.orderService.createOrder({ userId, items, notes, idempotencyKey }), 'createOrder');
  }

  getOrder(id: string): Observable<OrderResponse> {
    this.logger.log(`Fetching order with id: ${id}`);
    return this.call(this.orderService.getOrder({ id }), 'getOrder');
  }

  getOrdersByUser(userId: string, query: GetOrdersQueryDto): Observable<OrderListResponse> {
    this.logger.log(`Fetching orders for userId: ${userId}, page: ${query.page}, limit: ${query.limit}`);
    const { page, limit, statuses, dateFrom, dateTo, minPrice, maxPrice, currency, sortField, sortOrder } = query;
    return this.call(
      this.orderService.getOrdersByUser({
        userId,
        page,
        limit,
        filters: { statuses: statuses ?? [], dateFrom, dateTo, minPrice, maxPrice, currency },
        sort: sortField ? { field: sortField, order: sortOrder ?? 0 } : undefined,
      }),
      'getOrdersByUser',
    );
  }

  getAllOrders(query: GetOrdersQueryDto): Observable<OrderListResponse> {
    this.logger.log(`Fetching all orders, page: ${query.page}, limit: ${query.limit}`);
    const { page, limit, statuses, dateFrom, dateTo, minPrice, maxPrice, currency, sortField, sortOrder } = query;
    return this.call(
      this.orderService.getAllOrders({
        page,
        limit,
        filters: { statuses: statuses ?? [], dateFrom, dateTo, minPrice, maxPrice, currency },
        sort: sortField ? { field: sortField, order: sortOrder ?? 0 } : undefined,
      }),
      'getAllOrders',
    );
  }

  updateOrderStatus(id: string, changedBy: string, { status, notes }: UpdateOrderStatusDto): Observable<OrderResponse> {
    this.logger.log(`Updating status of order id: ${id} to: ${status}`);
    return this.call(this.orderService.updateOrderStatus({ id, status, changedBy, notes }), 'updateOrderStatus');
  }

  cancelOrder(id: string, userId: string): Observable<OrderResponse> {
    this.logger.log(`Cancelling order id: ${id} for userId: ${userId}`);
    return this.call(this.orderService.cancelOrder({ id, userId }), 'cancelOrder');
  }

  getOrderStatusHistory(id: string): Observable<OrderStatusHistoryResponse> {
    this.logger.log(`Fetching status history for order id: ${id}`);
    return this.call(this.orderService.getOrderStatusHistory({ id }), 'getOrderStatusHistory');
  }

  refundOrder(id: string, userId: string, { reason }: RefundOrderDto): Observable<OrderResponse> {
    this.logger.log(`Refunding order id: ${id} for userId: ${userId}`);
    return this.call(this.orderService.refundOrder({ id, userId, reason }), 'refundOrder');
  }
}
