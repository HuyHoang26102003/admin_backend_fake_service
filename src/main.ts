import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

if (!crypto.randomUUID) {
  Object.defineProperty(crypto, 'randomUUID', {
    value: uuidv4,
    writable: false,
    configurable: false,
    enumerable: true
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('FlashFood Fake Backend Service Starting...');
  console.log('Will send data to main backend at: http://localhost:1310');
  console.log('Data generation intervals:');
  console.log('   • Orders: Every 30 seconds');
  console.log('   • Users (Customers/Drivers): Every 60 seconds');
  console.log('   • Customer Care: Every 90 seconds');
  console.log('   • Restaurants: Every 120 seconds');
  console.log('');

  await app.listen(2610);
  console.log('✅ Fake backend is running on port 2610');
  console.log('💡 Check logs below for data generation status...');
  console.log('=====================================');
}
bootstrap();
