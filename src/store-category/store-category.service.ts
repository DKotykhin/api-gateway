import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { MetricsService } from 'src/supervision/metrics/metrics.service';

import {
  STORE_CATEGORY_SERVICE_NAME,
  StoreCategoryTranslationRequest,
  type ChangeStoreCategoryPositionRequest,
  type CreateStoreCategoryRequest,
  type Id,
  type StatusResponse,
  type StoreCategory,
  type StoreCategoryList,
  type StoreCategoryServiceClient,
  type StoreCategoryWithTranslations,
  type UpdateStoreCategoryRequest,
} from 'src/generated-types/store-category';
import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { UpsertStoreCategoryTranslationDto } from './dto';

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
export class StoreCategoryService implements OnModuleInit {
  private storeCategoryService: StoreCategoryServiceClient;
  private readonly logger = new Logger(StoreCategoryService.name);

  constructor(
    @Inject('STORE_CATEGORY_CLIENT')
    private readonly storeCategoryMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  onModuleInit() {
    this.storeCategoryService =
      this.storeCategoryMicroserviceClient.getService<StoreCategoryServiceClient>(STORE_CATEGORY_SERVICE_NAME);
  }

  private call<T>(source: Observable<T>, method: string): Observable<T> {
    return source.pipe(
      this.circuitBreaker.protect(TARGET_SERVICE),
      this.metricsService.trackGrpcCall(TARGET_SERVICE, method),
    );
  }

  getStoreCategoriesByLanguage(language = 'EN'): Observable<StoreCategoryList> {
    this.logger.log(`Fetching store categories for language: ${language}`);
    const grpcLanguage = mapLanguageToGrpcEnum(language);
    return this.call(
      this.storeCategoryService.getStoreCategoriesByLanguage({ language: grpcLanguage }),
      'getStoreCategoriesByLanguage',
    );
  }

  getStoreCategoryById(id: string): Observable<StoreCategoryWithTranslations> {
    this.logger.log(`Fetching store category by ID: ${id}`);
    return this.call(this.storeCategoryService.getStoreCategoryById({ id }), 'getStoreCategoryById');
  }

  createStoreCategory(data: CreateStoreCategoryRequest): Observable<Id> {
    this.logger.log(`Creating store category with data: ${JSON.stringify(data)}`);
    return this.call(this.storeCategoryService.createStoreCategory(data), 'createStoreCategory');
  }

  updateStoreCategory(data: UpdateStoreCategoryRequest): Observable<Id> {
    this.logger.log(`Updating store category with data: ${JSON.stringify(data)}`);
    return this.call(this.storeCategoryService.updateStoreCategory(data), 'updateStoreCategory');
  }

  deleteStoreCategory(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting store category with ID: ${id}`);
    return this.call(this.storeCategoryService.deleteStoreCategory({ id }), 'deleteStoreCategory');
  }

  changeStoreCategoryPosition(data: ChangeStoreCategoryPositionRequest): Observable<StoreCategory> {
    this.logger.log(`Changing position of store category with ID: ${data.id} to new position: ${data.sortOrder}`);
    return this.call(this.storeCategoryService.changeStoreCategoryPosition(data), 'changeStoreCategoryPosition');
  }

  upsertStoreCategoryTranslation(data: UpsertStoreCategoryTranslationDto): Observable<Id> {
    this.logger.log(
      `Upserting translation for store category with ID: ${data.categoryId} and language: ${data.language}`,
    );
    const grpcData: StoreCategoryTranslationRequest = {
      ...data,
      language: mapLanguageToGrpcEnum(data.language),
    };
    return this.call(
      this.storeCategoryService.upsertStoreCategoryTranslation(grpcData),
      'upsertStoreCategoryTranslation',
    );
  }

  deleteStoreCategoryTranslation(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting translation for store category with translation ID: ${id}`);
    return this.call(
      this.storeCategoryService.deleteStoreCategoryTranslation({ id }),
      'deleteStoreCategoryTranslation',
    );
  }
}
