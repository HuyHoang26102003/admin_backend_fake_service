import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { faker } from '@faker-js/faker';

@Injectable()
export class OrderGeneratorService {
  private readonly logger = new Logger(OrderGeneratorService.name);

  constructor(private readonly httpService: HttpService) {}

  @Interval(30000) // Generate fake orders every 30 seconds
  generateAndSendOrder() {
    this.logger.log('🍔 Generating and sending fake order data...');

    const orderStatusTypes = [
      'PENDING',
      'RESTAURANT_ACCEPTED',
      'PREPARING',
      'IN_PROGRESS',
      'READY_FOR_PICKUP',
      'RESTAURANT_PICKUP',
      'DISPATCHED',
      'EN_ROUTE',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'DELIVERY_FAILED'
    ];

    const paymentStatusTypes = ['PENDING', 'PAID', 'FAILED'];
    const paymentMethodTypes = ['COD', 'FWallet'];
    const trackingInfoTypes = [
      'ORDER_PLACED',
      'ORDER_RECEIVED',
      'PREPARING',
      'IN_PROGRESS',
      'RESTAURANT_PICKUP',
      'DISPATCHED',
      'EN_ROUTE',
      'OUT_FOR_DELIVERY',
      'DELIVERY_FAILED',
      'DELIVERED'
    ];

    // Generate fake order items
    const generateFakeOrderItem = () => ({
      item_id: faker.string.uuid(),
      variant_id: faker.string.uuid(),
      name: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 5 }),
      price_at_time_of_order: parseFloat(faker.commerce.price()),
      price_after_applied_promotion:
        Math.random() < 0.5
          ? parseFloat(faker.commerce.price({ max: 50 }))
          : undefined
    });

    const fakeOrder = {
      customer_id: faker.string.uuid(),
      restaurant_id: faker.string.uuid(),
      distance: faker.number.float({ min: 0.5, max: 10, fractionDigits: 1 }),
      status: faker.helpers.arrayElement(orderStatusTypes),
      total_amount: parseFloat(faker.commerce.price({ min: 100, max: 1000 })),
      delivery_fee: parseFloat(faker.commerce.price({ min: 10, max: 50 })),
      service_fee: parseFloat(faker.commerce.price({ min: 5, max: 20 })),
      payment_status: faker.helpers.arrayElement(paymentStatusTypes),
      payment_method: faker.helpers.arrayElement(paymentMethodTypes),
      customer_location: `${faker.location.latitude()},${faker.location.longitude()}`,
      restaurant_location: `${faker.location.latitude()},${faker.location.longitude()}`,
      order_items: Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        () => generateFakeOrderItem()
      ),
      customer_note: Math.random() < 0.3 ? faker.lorem.sentence() : undefined,
      restaurant_note: Math.random() < 0.2 ? faker.lorem.sentence() : undefined,
      order_time: faker.date.recent({ days: 7 }).getTime(),
      delivery_time: faker.date.recent({ days: 2 }).getTime() + 1000 * 60 * 30,
      tracking_info: faker.helpers.arrayElement(trackingInfoTypes),
      promotion_applied: Math.random() < 0.5 ? faker.string.uuid() : undefined
    };

    // Send to main backend
    this.httpService.post('http://localhost:1310/orders', fakeOrder).subscribe({
      next: response => {
        this.logger.log(
          `✅ Fake order sent successfully! Status: ${response.status} | Order ID: ${fakeOrder.customer_id?.substring(0, 8)}...`
        );
      },
      error: error => {
        this.logger.error(`❌ Failed to send fake order: ${error.message}`);
      }
    });
  }
}
