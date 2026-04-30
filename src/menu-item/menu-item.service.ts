import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  MENU_ITEM_SERVICE_NAME,
  type CreateMenuItemRequest,
  type CreateMenuItemTranslationRequest,
  type MenuItem,
  type MenuItemListWithTranslation,
  type MenuItemServiceClient,
  type MenuItemTranslation,
  type MenuItemWithTranslation,
  type StatusResponse,
  type UpdateMenuItemRequest,
  type UpdateMenuItemTranslationRequest,
} from 'src/generated-types/menu-item';
import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { MetricsService } from 'src/supervision/metrics/metrics.service';

const TARGET_SERVICE = 'menu-microservice';

@Injectable()
export class MenuItemService implements OnModuleInit {
  private menuItemService: MenuItemServiceClient;
  private readonly logger = new Logger(MenuItemService.name);

  constructor(
    @Inject('MENU_ITEM_CLIENT')
    private readonly menuItemMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  onModuleInit() {
    this.menuItemService = this.menuItemMicroserviceClient.getService<MenuItemServiceClient>(MENU_ITEM_SERVICE_NAME);
  }

  private call<T>(source: Observable<T>, method: string): Observable<T> {
    return source.pipe(
      this.circuitBreaker.protect(TARGET_SERVICE),
      this.metricsService.trackGrpcCall(TARGET_SERVICE, method),
    );
  }

  getMenuItemsByCategoryId(id: string): Observable<MenuItemListWithTranslation> {
    this.logger.log(`Fetching menu items for category ID: ${id}`);
    return this.call(this.menuItemService.getMenuItemsByCategoryId({ id }), 'getMenuItemsByCategoryId');
  }

  getMenuItemById(id: string): Observable<MenuItemWithTranslation> {
    this.logger.log(`Fetching menu item by ID: ${id}`);
    return this.call(this.menuItemService.getMenuItemById({ id }), 'getMenuItemById');
  }

  createMenuItem(data: CreateMenuItemRequest): Observable<MenuItem> {
    this.logger.log(`Creating new menu item with data: ${JSON.stringify(data)}`);
    return this.call(this.menuItemService.createMenuItem(data), 'createMenuItem');
  }

  updateMenuItem(data: UpdateMenuItemRequest): Observable<MenuItem> {
    this.logger.log(`Updating menu item with data: ${JSON.stringify(data)}`);
    return this.call(this.menuItemService.updateMenuItem(data), 'updateMenuItem');
  }

  deleteMenuItem(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting menu item with ID: ${id}`);
    return this.call(this.menuItemService.deleteMenuItem({ id }), 'deleteMenuItem');
  }

  changeMenuItemPosition({ id, position }: { id: string; position: number }): Observable<MenuItem> {
    this.logger.log(`Changing position of menu item ID: ${id} to position: ${position}`);
    return this.call(this.menuItemService.changeMenuItemPosition({ id, position }), 'changeMenuItemPosition');
  }

  createMenuItemTranslation(data: CreateMenuItemTranslationRequest): Observable<MenuItemTranslation> {
    this.logger.log(`Creating translation for menu item with data: ${JSON.stringify(data)}`);
    return this.call(this.menuItemService.createMenuItemTranslation(data), 'createMenuItemTranslation');
  }

  updateMenuItemTranslation(data: UpdateMenuItemTranslationRequest): Observable<MenuItemTranslation> {
    this.logger.log(`Updating translation for menu item with data: ${JSON.stringify(data)}`);
    return this.call(this.menuItemService.updateMenuItemTranslation(data), 'updateMenuItemTranslation');
  }

  deleteMenuItemTranslation(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting translation for menu item with ID: ${id}`);
    return this.call(this.menuItemService.deleteMenuItemTranslation({ id }), 'deleteMenuItemTranslation');
  }
}
