import { BadRequestException, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  USER_SERVICE_NAME,
  UserRole,
  type AllUsersResponse,
  type BanDetailsResponse,
  type BanUserRequest,
  type DeliveryAddress,
  type GetBannedUsersResponse,
  type GetDeliveryAddressesResponse,
  type PaginationMeta,
  type PasswordRequest,
  type StatusResponse,
  type UpdateUserRequest,
  type UpsertDeliveryAddressRequest,
  type User,
  type UserRoleRequest,
  type UserServiceClient,
} from 'src/generated-types/user';
import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { MetricsService } from 'src/supervision/metrics/metrics.service';

const TARGET_SERVICE = 'user-microservice';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('USER_CLIENT')
    private readonly userMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  onModuleInit() {
    this.userService = this.userMicroserviceClient.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  private call<T>(source: Observable<T>, method: string): Observable<T> {
    return source.pipe(
      this.circuitBreaker.protect(TARGET_SERVICE),
      this.metricsService.trackGrpcCall(TARGET_SERVICE, method),
    );
  }

  getUserById(id: string, currentUserId: string): Observable<User> {
    this.logger.log(`Fetching user by ID: ${id}`);
    if (id !== currentUserId) {
      this.logger.warn(`User ID mismatch: requested ID ${id} does not match current user ID ${currentUserId}`);
      throw new BadRequestException('You can only fetch your own user profile.');
    }
    return this.call(this.userService.getUserById({ id }), 'getUserById');
  }

  getAllUsers(data: PaginationMeta): Observable<AllUsersResponse> {
    this.logger.log(`Fetching all users with page: ${data.page}, limit: ${data.limit}`);
    return this.call(this.userService.getAllUsers(data), 'getAllUsers');
  }

  updateUser(data: UpdateUserRequest): Observable<User> {
    this.logger.log(`Updating user with ID: ${data.id}`);
    if (!data.name && !data.phoneNumber) {
      this.logger.warn(`No update fields provided for user ID: ${data.id}`);
      throw new BadRequestException('At least one field (name, phoneNumber) must be provided for update.');
    }
    return this.call(this.userService.updateUser(data), 'updateUser');
  }

  deleteUser(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting user with ID: ${id}`);
    return this.call(this.userService.deleteUser({ id }), 'deleteUser');
  }

  confirmPassword(data: PasswordRequest): Observable<StatusResponse> {
    this.logger.log(`Confirming password for user ID: ${data.id}`);
    return this.call(this.userService.confirmPassword(data), 'confirmPassword');
  }

  changePassword(data: PasswordRequest): Observable<StatusResponse> {
    this.logger.log(`Changing password for user ID: ${data.id}`);
    return this.call(this.userService.changePassword(data), 'changePassword');
  }

  banUser(data: BanUserRequest): Observable<User> {
    this.logger.log(`Banning user with ID: ${data.id}`);
    return this.call(this.userService.banUser(data), 'banUser');
  }

  unbanUser(data: BanUserRequest): Observable<User> {
    this.logger.log(`Unbanning user with ID: ${data.id}`);
    return this.call(this.userService.unbanUser(data), 'unbanUser');
  }

  getBannedUsers(): Observable<GetBannedUsersResponse> {
    this.logger.log(`Fetching all banned users`);
    return this.call(this.userService.getBannedUsers({}), 'getBannedUsers');
  }

  getBanDetailsByUserId(id: string): Observable<BanDetailsResponse> {
    this.logger.log(`Fetching ban details for user ID: ${id}`);
    return this.call(this.userService.getBanDetailsByUserId({ id }), 'getBanDetailsByUserId');
  }

  changeUserRole(data: UserRoleRequest): Observable<User> {
    this.logger.log(`Changing role for user ID: ${data.id} to ${UserRole[data.role]}`);
    return this.call(this.userService.changeUserRole(data), 'changeUserRole');
  }

  getDeliveryAddresses(userId: string): Observable<GetDeliveryAddressesResponse> {
    this.logger.log(`Fetching delivery addresses for user ID: ${userId}`);
    return this.call(this.userService.getDeliveryAddresses({ id: userId }), 'getDeliveryAddresses');
  }

  upsertDeliveryAddress(data: UpsertDeliveryAddressRequest): Observable<DeliveryAddress> {
    this.logger.log(`Upserting delivery address for user ID: ${data.userId}`);
    return this.call(this.userService.upsertDeliveryAddress(data), 'upsertDeliveryAddress');
  }

  deleteDeliveryAddress(addressId: string): Observable<StatusResponse> {
    this.logger.log(`Deleting delivery address with ID: ${addressId}`);
    return this.call(this.userService.deleteDeliveryAddress({ id: addressId }), 'deleteDeliveryAddress');
  }
}
