import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Protected } from 'src/auth/decorators';
import { UserRole } from 'src/generated-types/user';
import type { PaymentResponse } from 'src/generated-types/payment';
import { RefundPaymentDto } from './dto';
import { PaymentService } from './payment.service';

@ApiTags('payment')
@Protected(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('payment')
export class PaymentAdminController {
  private readonly logger = new Logger(PaymentAdminController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post(':paymentId/refund')
  @ApiOperation({ summary: 'Refund payment', description: 'Issues a refund for a payment (admin only)' })
  @ApiParam({ name: 'paymentId', type: String, format: 'uuid' })
  @ApiBody({ type: RefundPaymentDto })
  @ApiResponse({ status: 200, description: 'Returns the updated payment after refund' })
  refundPayment(@Param('paymentId') paymentId: string, @Body() data: RefundPaymentDto): Observable<PaymentResponse> {
    this.logger.log(`Received request to refund payment with id: ${paymentId}`);
    return this.paymentService.refundPayment(paymentId, data);
  }

  @Post(':paymentId/cancel')
  @ApiOperation({ summary: 'Cancel payment', description: 'Cancels a pending payment (admin only)' })
  @ApiParam({ name: 'paymentId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns the updated payment after cancellation' })
  cancelPayment(@Param('paymentId') paymentId: string): Observable<PaymentResponse> {
    this.logger.log(`Received request to cancel payment with id: ${paymentId}`);
    return this.paymentService.cancelPayment(paymentId);
  }
}
