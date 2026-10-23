import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness check; does not expose secrets or database state' })
  getHealth(): { status: 'ok'; service: 'save-backend' } {
    return { status: 'ok', service: 'save-backend' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness placeholder; database checks must be added before production' })
  getReady() {
    return { status: 'not-ready-for-production', checks: { database: 'not-configured' } };
  }
}
