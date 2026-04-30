import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { MetricsService } from 'src/supervision/metrics/metrics.service';
import {
  STORE_ATTRIBUTE_SERVICE_NAME,
  type AttributeList,
  type AttributeResponse,
  type AttributeTranslationRequest,
  type ChangeAttributePositionRequest,
  type CreateAttributeRequest,
  type Id,
  type StatusResponse,
  type StoreAttributeServiceClient,
  type UpdateAttributeRequest,
} from 'src/generated-types/store-attribute';
import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { UpsertStoreAttributeTranslationDto } from './dto';

const TARGET_SERVICE = 'store-microservice';

function mapLanguageToGrpcEnum(language: string): number {
  switch (language.toUpperCase()) {
    case 'EN':
      return 1;
    case 'UA':
      return 2;
    case 'RU':
      return 3;
    default:
      return 1;
  }
}

@Injectable()
export class StoreAttributeService implements OnModuleInit {
  private storeAttributeService: StoreAttributeServiceClient;
  private readonly logger = new Logger(StoreAttributeService.name);

  constructor(
    @Inject('STORE_ATTRIBUTE_CLIENT')
    private readonly storeAttributeMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  onModuleInit() {
    this.storeAttributeService =
      this.storeAttributeMicroserviceClient.getService<StoreAttributeServiceClient>(STORE_ATTRIBUTE_SERVICE_NAME);
  }

  private call<T>(source: Observable<T>, method: string): Observable<T> {
    return source.pipe(
      this.circuitBreaker.protect(TARGET_SERVICE),
      this.metricsService.trackGrpcCall(TARGET_SERVICE, method),
    );
  }

  getAttributesByCategoryId(categoryId: string): Observable<AttributeList> {
    this.logger.log(`Fetching attributes for category ID: ${categoryId}`);
    return this.call(this.storeAttributeService.getAttributesByCategoryId({ categoryId }), 'getAttributesByCategoryId');
  }

  createAttribute(data: CreateAttributeRequest): Observable<Id> {
    this.logger.log(`Creating attribute with data: ${JSON.stringify(data)}`);
    return this.call(this.storeAttributeService.createAttribute(data), 'createAttribute');
  }

  updateAttribute(data: UpdateAttributeRequest): Observable<Id> {
    this.logger.log(`Updating attribute with data: ${JSON.stringify(data)}`);
    return this.call(this.storeAttributeService.updateAttribute(data), 'updateAttribute');
  }

  deleteAttribute(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting attribute with ID: ${id}`);
    return this.call(this.storeAttributeService.deleteAttribute({ id }), 'deleteAttribute');
  }

  changeAttributePosition(data: ChangeAttributePositionRequest): Observable<AttributeResponse> {
    this.logger.log(`Changing position of attribute with ID: ${data.id} to new position: ${data.sortOrder}`);
    return this.call(this.storeAttributeService.changeAttributePosition(data), 'changeAttributePosition');
  }

  upsertAttributeTranslation(data: UpsertStoreAttributeTranslationDto): Observable<Id> {
    const grpcData: AttributeTranslationRequest = {
      ...data,
      language: mapLanguageToGrpcEnum(data.language),
    };
    this.logger.log(
      `Upserting translation for attribute ID: ${data.attributeId} with language code: ${data.language} and name: ${data.name}`,
    );
    return this.call(this.storeAttributeService.upsertAttributeTranslation(grpcData), 'upsertAttributeTranslation');
  }

  deleteAttributeTranslation(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting attribute translation with ID: ${id}`);
    return this.call(this.storeAttributeService.deleteAttributeTranslation({ id }), 'deleteAttributeTranslation');
  }
}
