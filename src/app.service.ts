import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🚀 FlashFood Fake Backend Service is running';
  }
}
