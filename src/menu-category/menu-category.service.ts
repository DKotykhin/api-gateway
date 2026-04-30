import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  type CreateMenuCategoryRequest,
  type CreateMenuCategoryTranslationRequest,
  type FullMenuResponse,
  MENU_CATEGORY_SERVICE_NAME,
  type MenuCategory,
  type MenuCategoryListWithTranslation,
  type MenuCategoryServiceClient,
  type MenuCategoryTranslation,
  type MenuCategoryWithTranslation,
  type StatusResponse,
  type UpdateMenuCategoryTranslationRequest,
} from 'src/generated-types/menu-category';
import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { MetricsService } from 'src/supervision/metrics/metrics.service';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';

const TARGET_SERVICE = 'menu-microservice';

@Injectable()
export class MenuCategoryService implements OnModuleInit {
  private menuCategoryService: MenuCategoryServiceClient;
  private readonly logger = new Logger(MenuCategoryService.name);

  constructor(
    @Inject('MENU_CATEGORY_CLIENT')
    private readonly menuCategoryMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  onModuleInit() {
    this.menuCategoryService =
      this.menuCategoryMicroserviceClient.getService<MenuCategoryServiceClient>(MENU_CATEGORY_SERVICE_NAME);
  }

  private call<T>(source: Observable<T>, method: string): Observable<T> {
    return source.pipe(
      this.circuitBreaker.protect(TARGET_SERVICE),
      this.metricsService.trackGrpcCall(TARGET_SERVICE, method),
    );
  }

  getFullMenuByLanguage(language = 'EN'): Observable<FullMenuResponse> {
    this.logger.log(`Fetching full menu for language: ${language}`);
    return this.call(this.menuCategoryService.getFullMenuByLanguage({ language }), 'getFullMenuByLanguage');
  }

  getMenuCategoriesByLanguage(language = 'EN'): Observable<MenuCategoryListWithTranslation> {
    this.logger.log(`Fetching menu categories for language: ${language}`);
    return this.call(this.menuCategoryService.getMenuCategoriesByLanguage({ language }), 'getMenuCategoriesByLanguage');
  }

  getMenuCategoryById(id: string): Observable<MenuCategoryWithTranslation> {
    this.logger.log(`Fetching menu category by ID: ${id}`);
    return this.call(this.menuCategoryService.getMenuCategoryById({ id }), 'getMenuCategoryById');
  }

  createMenuCategory(data: CreateMenuCategoryRequest): Observable<MenuCategory> {
    this.logger.log(`Creating menu category with data: ${JSON.stringify(data)}`);
    return this.call(this.menuCategoryService.createMenuCategory(data), 'createMenuCategory');
  }

  updateMenuCategory(id: string, data: UpdateMenuCategoryDto): Observable<MenuCategory> {
    this.logger.log(`Updating menu category with ID: ${id} and data: ${JSON.stringify(data)}`);
    return this.call(this.menuCategoryService.updateMenuCategory({ id, ...data }), 'updateMenuCategory');
  }

  changeMenuCategoryPosition(id: string, position: number): Observable<MenuCategory> {
    this.logger.log(`Changing position of menu category ID: ${id} to position: ${position}`);
    return this.call(
      this.menuCategoryService.changeMenuCategoryPosition({ id, position }),
      'changeMenuCategoryPosition',
    );
  }

  deleteMenuCategory(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting menu category with ID: ${id}`);
    return this.call(this.menuCategoryService.deleteMenuCategory({ id }), 'deleteMenuCategory');
  }

  createMenuCategoryTranslation(data: CreateMenuCategoryTranslationRequest): Observable<MenuCategoryTranslation> {
    this.logger.log(`Creating menu category translation with data: ${JSON.stringify(data)}`);
    return this.call(this.menuCategoryService.createMenuCategoryTranslation(data), 'createMenuCategoryTranslation');
  }

  updateMenuCategoryTranslation(data: UpdateMenuCategoryTranslationRequest): Observable<MenuCategoryTranslation> {
    this.logger.log(`Updating menu category translation with ID: ${data.id} and data: ${JSON.stringify(data)}`);
    return this.call(this.menuCategoryService.updateMenuCategoryTranslation(data), 'updateMenuCategoryTranslation');
  }

  deleteMenuCategoryTranslation(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting menu category translation with ID: ${id}`);
    return this.call(this.menuCategoryService.deleteMenuCategoryTranslation({ id }), 'deleteMenuCategoryTranslation');
  }
}
