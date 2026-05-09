import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Protected, UserId } from 'src/auth/decorators';
import type {
  CreateCheckoutSessionResponse,
  CreatePaymentIntentResponse,
  GetPaymentsResponse,
  PaymentResponse,
} from 'src/generated-types/payment';
import { CreateCheckoutSessionDto, CreatePaymentIntentDto, PaymentPaginationQueryDto } from './dto';
import { PaymentService } from './payment.service';

@ApiTags('payment')
@Protected()
@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('intent')
  @ApiOperation({ summary: 'Create payment intent', description: 'Creates a Stripe payment intent for an order' })
  @ApiBody({ type: CreatePaymentIntentDto })
  @ApiResponse({ status: 201, description: 'Returns the payment intent client secret and payment ID' })
  createPaymentIntent(
    @UserId() userId: string,
    @Body() data: CreatePaymentIntentDto,
  ): Observable<CreatePaymentIntentResponse> {
    this.logger.log(`Received request to create payment intent for userId: ${userId}`);
    return this.paymentService.createPaymentIntent(userId, data);
  }

  @Post('checkout-session')
  @ApiOperation({
    summary: 'Create checkout session',
    description: 'Creates a Stripe hosted checkout session for an order',
  })
  @ApiBody({ type: CreateCheckoutSessionDto })
  @ApiResponse({ status: 201, description: 'Returns the checkout session URL and payment ID' })
  createCheckoutSession(
    @UserId() userId: string,
    @Body() data: CreateCheckoutSessionDto,
  ): Observable<CreateCheckoutSessionResponse> {
    this.logger.log(`Received request to create checkout session for userId: ${userId}`);
    return this.paymentService.createCheckoutSession(userId, data);
  }

  @Get('my')
  @ApiOperation({
    summary: 'Get my payments',
    description: 'Returns paginated payment history for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Returns the list of payments for the authenticated user' })
  getPaymentsByUser(
    @UserId() userId: string,
    @Query() query: PaymentPaginationQueryDto,
  ): Observable<GetPaymentsResponse> {
    this.logger.log(`Received request to get payments for userId: ${userId}`);
    return this.paymentService.getPaymentsByUser(userId, query);
  }

  @Get('by-order/:orderId')
  @ApiOperation({
    summary: 'Get payments by order',
    description: 'Returns all payments associated with a specific order',
  })
  @ApiParam({ name: 'orderId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns the list of payments for the specified order' })
  getPaymentsByOrder(
    @Param('orderId') orderId: string,
    @Query() query: PaymentPaginationQueryDto,
  ): Observable<GetPaymentsResponse> {
    this.logger.log(`Received request to get payments for orderId: ${orderId}`);
    return this.paymentService.getPaymentsByOrder(orderId, query);
  }

  @Get(':paymentId')
  @ApiOperation({ summary: 'Get payment by ID', description: 'Returns a single payment by its ID' })
  @ApiParam({ name: 'paymentId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns the payment with the specified ID' })
  getPayment(@Param('paymentId') paymentId: string): Observable<PaymentResponse> {
    this.logger.log(`Received request to get payment with id: ${paymentId}`);
    return this.paymentService.getPayment(paymentId);
  }
}
