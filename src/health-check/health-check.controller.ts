import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CircuitBreakerService } from 'src/supervision/circuit-breaker/circuit-breaker.service';
import { AllAppsResponse, HealthCheckService } from './health-check.service';

@ApiTags('health-check')
@Controller('health-check')
export class HealthCheckController {
  private readonly logger = new Logger(HealthCheckController.name);
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  @Get('all-apps')
  @ApiOperation({
    summary: 'Check microservices connection',
    description: 'Checks the health status of all connected microservices',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of all connected microservices',
    examples: {
      example1: {
        summary: 'Healthy microservices',
        value: {
          menuMicroservice: {
            appHealth: { serving: true, message: 'Menu microservice app is healthy' },
            dbHealth: { serving: true, message: 'Menu microservice database is healthy' },
          },
          userMicroservice: {
            appHealth: { serving: true, message: 'User microservice app is healthy' },
            dbHealth: { serving: true, message: 'User microservice database is healthy' },
          },
          notificationMicroservice: { serving: true, message: 'Notification microservice app is healthy' },
          mediaMicroservice: { serving: true, message: 'Media microservice app is healthy' },
        },
      },
      example2: {
        summary: 'Unhealthy microservices',
        value: {
          menuMicroservice: {
            appHealth: { serving: false, message: 'Menu microservice app is unavailable' },
            dbHealth: { serving: false, message: 'Menu microservice database is unavailable' },
          },
          userMicroservice: {
            appHealth: { serving: false, message: 'User microservice app is unavailable' },
            dbHealth: { serving: false, message: 'User microservice database is unavailable' },
          },
          notificationMicroservice: { serving: false, message: 'Notification microservice app is unavailable' },
          mediaMicroservice: { serving: false, message: 'Media microservice app is unavailable' },
        },
      },
    },
  })
  async checkHealth(): Promise<AllAppsResponse> {
    this.logger.log('Health check requested at API Gateway');
    return this.healthCheckService.checkAllMicroservicesHealth();
  }

  @Get('user-connections')
  @ApiOperation({
    summary: 'Check user microservice connections',
    description: 'Checks the health status of user microservice connections to its dependencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of user microservice connections',
    examples: {
      example1: {
        summary: 'Healthy connections',
        value: {
          serving: true,
          message: 'User microservice connections are healthy',
          dependencies: [
            { name: 'PostgreSQL', type: 'database', status: { serving: true, message: 'PostgreSQL is healthy' } },
            { name: 'Redis', type: 'cache', status: { serving: true, message: 'Redis is healthy' } },
          ],
        },
      },
      example2: {
        summary: 'Unhealthy connections',
        value: {
          serving: false,
          message: 'User microservice connections are not healthy',
          dependencies: [
            { name: 'PostgreSQL', type: 'database', status: { serving: false, message: 'PostgreSQL is unavailable' } },
            { name: 'Redis', type: 'cache', status: { serving: false, message: 'Redis is unavailable' } },
          ],
        },
      },
    },
  })
  async checkUserConnections() {
    this.logger.log('User microservice connections check requested at API Gateway');
    return this.healthCheckService.checkUserMicroserviceConnections();
  }

  @Get('menu-connections')
  @ApiOperation({
    summary: 'Check menu microservice connections',
    description: 'Checks the health status of menu microservice connections to its dependencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of menu microservice connections',
    examples: {
      example1: {
        summary: 'Healthy connections',
        value: {
          serving: true,
          message: 'Menu microservice connections are healthy',
          dependencies: [
            { name: 'PostgreSQL', type: 'database', status: { serving: true, message: 'PostgreSQL is healthy' } },
          ],
        },
      },
      example2: {
        summary: 'Unhealthy connections',
        value: {
          serving: false,
          message: 'Menu microservice connections are not healthy',
          dependencies: [
            { name: 'PostgreSQL', type: 'database', status: { serving: false, message: 'PostgreSQL is unavailable' } },
          ],
        },
      },
    },
  })
  async checkMenuConnections() {
    this.logger.log('Menu microservice connections check requested at API Gateway');
    return this.healthCheckService.checkMenuMicroserviceConnections();
  }

  @Get('circuit-breakers')
  @ApiOperation({
    summary: 'Circuit breaker states',
    description: 'Returns the current state of all circuit breakers (Closed / Open / HalfOpen)',
  })
  getCircuitBreakers(): Record<string, string> {
    return this.circuitBreakerService.getStates();
  }
}
