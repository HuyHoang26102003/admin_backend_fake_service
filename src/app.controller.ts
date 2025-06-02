import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('status')
  getStatus() {
    return {
      status: 'running',
      service: 'FlashFood Fake Backend',
      target: 'http://localhost:1310',
      intervals: {
        orders: '30 seconds',
        users: '60 seconds',
        customerCare: '90 seconds',
        restaurants: '120 seconds'
      },
      timestamp: new Date().toISOString()
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}
