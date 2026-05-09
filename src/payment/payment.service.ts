import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  type CreateCheckoutSessionResponse,
  type CreatePaymentIntentResponse,
  type GetPaymentsResponse,
  PAYMENT_SERVICE_NAME,
  type PaymentResponse,
  type PaymentServiceClient,
} from 'src/generated-types/payment';
import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { MetricsService } from 'src/supervision/metrics/metrics.service';
import type {
  CreateCheckoutSessionDto,
  CreatePaymentIntentDto,
  PaymentPaginationQueryDto,
  RefundPaymentDto,
} from './dto';

const TARGET_SERVICE = 'payment-microservice';

@Injectable()
export class PaymentService implements OnModuleInit {
  private paymentService: PaymentServiceClient;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject('PAYMENT_CLIENT')
    private readonly paymentMicroserviceClient: ClientGrpc,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.paymentService = this.paymentMicroserviceClient.getService<PaymentServiceClient>(PAYMENT_SERVICE_NAME);
  }

  private call<T>(source: Observable<T>, method: string): Observable<T> {
    return source.pipe(
      this.circuitBreaker.protect(TARGET_SERVICE),
      this.metricsService.trackGrpcCall(TARGET_SERVICE, method),
    );
  }

  createPaymentIntent(userId: string, dto: CreatePaymentIntentDto): Observable<CreatePaymentIntentResponse> {
    this.logger.log(`Creating payment intent for userId: ${userId}, orderId: ${dto.orderId}`);
    return this.call(
      this.paymentService.createPaymentIntent({
        ...dto,
        userId,
        metadata: dto.metadata ?? {},
        paymentProvider: dto.paymentProvider ?? '',
      }),
      'createPaymentIntent',
    );
  }

  createCheckoutSession(userId: string, dto: CreateCheckoutSessionDto): Observable<CreateCheckoutSessionResponse> {
    this.logger.log(`Creating checkout session for userId: ${userId}, orderId: ${dto.orderId}`);
    return this.call(
      this.paymentService.createCheckoutSession({
        ...dto,
        userId,
        metadata: dto.metadata ?? {},
        paymentProvider: dto.paymentProvider ?? '',
      }),
      'createCheckoutSession',
    );
  }

  getPayment(paymentId: string): Observable<PaymentResponse> {
    this.logger.log(`Fetching payment with id: ${paymentId}`);
    return this.call(this.paymentService.getPayment({ paymentId }), 'getPayment');
  }

  getPaymentsByOrder(orderId: string, { page, limit }: PaymentPaginationQueryDto): Observable<GetPaymentsResponse> {
    this.logger.log(`Fetching payments for orderId: ${orderId}`);
    return this.call(this.paymentService.getPaymentsByOrder({ orderId, page, limit }), 'getPaymentsByOrder');
  }

  getPaymentsByUser(userId: string, { page, limit }: PaymentPaginationQueryDto): Observable<GetPaymentsResponse> {
    this.logger.log(`Fetching payments for userId: ${userId}`);
    return this.call(this.paymentService.getPaymentsByUser({ userId, page, limit }), 'getPaymentsByUser');
  }

  refundPayment(paymentId: string, dto: RefundPaymentDto): Observable<PaymentResponse> {
    this.logger.log(`Refunding payment with id: ${paymentId}`);
    return this.call(this.paymentService.refundPayment({ paymentId, ...dto }), 'refundPayment');
  }

  cancelPayment(paymentId: string): Observable<PaymentResponse> {
    this.logger.log(`Cancelling payment with id: ${paymentId}`);
    return this.call(this.paymentService.cancelPayment({ paymentId }), 'cancelPayment');
  }
}
