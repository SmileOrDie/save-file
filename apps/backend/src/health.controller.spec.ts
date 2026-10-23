import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns a minimal liveness response', () => {
    const controller = new HealthController();
    expect(controller.getHealth()).toEqual({ status: 'ok', service: 'save-backend' });
  });

  it('does not claim production readiness before dependencies are wired', () => {
    const controller = new HealthController();
    expect(controller.getReady().checks.database).toBe('not-configured');
  });
});
