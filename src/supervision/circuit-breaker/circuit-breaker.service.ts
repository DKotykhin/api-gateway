import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  BrokenCircuitError,
  CircuitBreakerPolicy,
  CircuitState,
  ConsecutiveBreaker,
  circuitBreaker,
  handleAll,
} from 'cockatiel';
import { MonoTypeOperatorFunction, Observable, firstValueFrom } from 'rxjs';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly breakers = new Map<string, CircuitBreakerPolicy>();

  private getBreaker(serviceName: string): CircuitBreakerPolicy {
    if (!this.breakers.has(serviceName)) {
      const policy = circuitBreaker(handleAll, {
        halfOpenAfter: 10_000, // try one request after 10s
        breaker: new ConsecutiveBreaker(2), // open after 2 consecutive failures (lower for testing, raise to 5 in prod)
      });

      policy.onBreak((reason) =>
        this.logger.warn(
          `[${serviceName}] Circuit OPEN — ${'error' in reason ? (reason.error?.message ?? 'unknown error') : 'circuit isolated'}`,
        ),
      );
      policy.onReset(() => this.logger.log(`[${serviceName}] Circuit CLOSED`));
      policy.onHalfOpen(() => this.logger.log(`[${serviceName}] Circuit HALF-OPEN, sending test request`));

      this.breakers.set(serviceName, policy);
    }
    return this.breakers.get(serviceName)!;
  }

  getStates(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [name, breaker] of this.breakers) {
      result[name] = CircuitState[breaker.state];
    }
    return result;
  }

  protect<T>(serviceName: string): MonoTypeOperatorFunction<T> {
    const breaker = this.getBreaker(serviceName);

    return (source: Observable<T>) =>
      new Observable<T>((subscriber) => {
        breaker
          .execute(() => firstValueFrom(source))
          .then((value) => {
            subscriber.next(value);
            subscriber.complete();
          })
          .catch((err) => {
            if (err instanceof BrokenCircuitError) {
              subscriber.error(new ServiceUnavailableException(`${serviceName} is currently unavailable`));
            } else {
              subscriber.error(err);
            }
          });
      });
  }
}
