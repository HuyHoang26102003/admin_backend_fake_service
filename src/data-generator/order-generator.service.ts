import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { faker } from '@faker-js/faker';
import { firstValueFrom } from 'rxjs';
import { DataPreparationService } from './data-preparation.service';

@Injectable()
export class OrderGeneratorService {
  private readonly logger = new Logger(OrderGeneratorService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly dataPreparationService: DataPreparationService
  ) {}

  @Interval(30000)
  async generateAndSendOrder() {
    this.logger.log('🚀 Starting order generation process...');

    try {
      // Step 1: Ensure all data is available using the comprehensive data preparation service
      this.logger.log(' Step 1: Ensuring data availability...');
      const dataCollection =
        await this.dataPreparationService.ensureDataAvailability();

      if (dataCollection.customers.length < 10) {
        this.logger.warn(
          '❌ Not enough customers available, skipping order generation'
        );
        return;
      }

      // Step 2: Generate order using the prepared data collection
      this.logger.log('🔨 Step 2: Generating order with prepared data...');
      await this.generateOrderWithDataCollection(dataCollection);
    } catch (error) {
      this.logger.error(
        `❌ Error in order generation process: ${error.message}`
      );
    }
  }

  private async generateOrderWithDataCollection(dataCollection: any) {
    this.logger.log(
      '🎯 Generating order with comprehensive data collection...'
    );

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

    // Select random entities from the prepared data
    const customer = faker.helpers.arrayElement(
      dataCollection.customers
    ) as any;
    const restaurant = faker.helpers.arrayElement(
      dataCollection.restaurants
    ) as any;

    this.logger.log(
      `Selected customer: ${customer.first_name} ${customer.last_name}`
    );
    this.logger.log(
      `Selected restaurant: ${restaurant.restaurant_name || restaurant.name}`
    );

    // Find addresses for the selected customer and restaurant
    const customerAddresses = dataCollection.addresses.filter(
      addr =>
        addr.user_id === customer.user_id ||
        addr.customer_id === customer.id ||
        addr.customer_id === customer.user_id
    );

    const restaurantAddresses = dataCollection.addresses.filter(
      addr => addr.restaurant_id === restaurant.id
    );

    if (customerAddresses.length === 0) {
      this.logger.warn(
        `No addresses found for customer ${customer.id}, skipping order`
      );
      return;
    }

    if (restaurantAddresses.length === 0) {
      this.logger.warn(
        `No addresses found for restaurant ${restaurant.id}, skipping order`
      );
      return;
    }

    const customerAddress = faker.helpers.arrayElement(
      customerAddresses
    ) as any;
    const restaurantAddress = faker.helpers.arrayElement(
      restaurantAddresses
    ) as any;

    this.logger.log(`Customer address: ${customerAddress.address_line}`);
    this.logger.log(`Restaurant address: ${restaurantAddress.address_line}`);

    // Select menu items from the chosen restaurant
    const restaurantMenuItems = dataCollection.menuItems.filter(
      item => item.restaurant_id === restaurant.id
    );

    if (restaurantMenuItems.length === 0) {
      this.logger.warn(
        `No menu items found for restaurant ${restaurant.id}, skipping order`
      );
      return;
    }

    // Generate order items using real menu items and variants
    const orderItemsCount = faker.number.int({
      min: 1,
      max: Math.min(3, restaurantMenuItems.length)
    });
    const selectedMenuItems = faker.helpers.arrayElements(
      restaurantMenuItems,
      orderItemsCount
    );

    const orderItems = selectedMenuItems.map((menuItem: any) => {
      const quantity = faker.number.int({ min: 1, max: 3 });

      // Find variants for this menu item
      const itemVariants = dataCollection.variants.filter(
        variant => variant.menu_item_id === menuItem.id
      );

      let variant = null;
      let price =
        menuItem.base_price ||
        parseFloat(faker.commerce.price({ min: 20, max: 200 }));

      // Use variant price if available (70% chance to use variant)
      if (itemVariants.length > 0 && Math.random() > 0.3) {
        variant = faker.helpers.arrayElement(itemVariants);
        price = variant.price;
        this.logger.log(
          `Using variant "${variant.name}" for ${menuItem.name} - Price: ${price}`
        );
      } else {
        this.logger.log(
          `Using base price for ${menuItem.name} - Price: ${price}`
        );
      }

      // Apply promotion occasionally (20% chance)
      const promotionDiscount = Math.random() < 0.2 ? 0.1 : 0; // 10% discount
      const discountedPrice = price * (1 - promotionDiscount);

      return {
        item_id: menuItem.id,
        variant_id: variant ? variant.id : undefined,
        name: menuItem.name,
        quantity: quantity,
        price_at_time_of_order: price,
        price_after_applied_promotion: Number(discountedPrice.toFixed(2))
      };
    });

    // Calculate totals accurately
    const itemsTotal = orderItems.reduce(
      (sum, item) => sum + item.price_after_applied_promotion * item.quantity,
      0
    );
    const deliveryFee = parseFloat(faker.commerce.price({ min: 10, max: 50 }));
    const serviceFee = parseFloat(faker.commerce.price({ min: 5, max: 20 }));
    const totalAmount = Number(
      (itemsTotal + deliveryFee + serviceFee).toFixed(2)
    );

    // Calculate realistic distance between addresses
    let distance = 1.0; // Default distance
    if (customerAddress.location && restaurantAddress.location) {
      const lat1 = customerAddress.location.lat;
      const lng1 = customerAddress.location.lng;
      const lat2 = restaurantAddress.location.lat;
      const lng2 = restaurantAddress.location.lng;

      // Haversine formula for distance calculation
      const R = 6371; // Radius of Earth in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = Number((R * c).toFixed(1));
    }

    // Apply promotion occasionally
    const availablePromotions = dataCollection.promotions.filter(
      promo =>
        promo.status === 'ACTIVE' &&
        promo.start_date <= Math.floor(Date.now() / 1000) &&
        promo.end_date >= Math.floor(Date.now() / 1000)
    );

    const selectedPromotion =
      Math.random() < 0.2 && availablePromotions.length > 0
        ? (faker.helpers.arrayElement(availablePromotions) as any)
        : null;

    // Create the order object
    const orderData = {
      customer_id: customer.id,
      restaurant_id: restaurant.id,
      distance: distance,
      status: faker.helpers.arrayElement(orderStatusTypes),
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      service_fee: serviceFee,
      payment_status: faker.helpers.arrayElement(paymentStatusTypes),
      payment_method: faker.helpers.arrayElement(paymentMethodTypes),
      customer_location: customerAddress.id,
      restaurant_location: restaurantAddress.id,
      order_items: orderItems,
      customer_note: Math.random() < 0.3 ? faker.lorem.sentence() : undefined,
      restaurant_note: Math.random() < 0.2 ? faker.lorem.sentence() : undefined,
      order_time: Math.floor(faker.date.recent({ days: 1 }).getTime() / 1000),
      delivery_time: Math.floor(
        (Date.now() + 1000 * 60 * faker.number.int({ min: 30, max: 90 })) / 1000
      ),
      tracking_info: faker.helpers.arrayElement(trackingInfoTypes),
      promotion_applied: selectedPromotion ? selectedPromotion.id : undefined
    };

    this.logger.log('📊 Generated order summary:', {
      customer: `${customer.first_name} ${customer.last_name}`,
      restaurant: restaurant.restaurant_name || restaurant.name,
      items_count: orderItems.length,
      total_amount: totalAmount,
      distance: `${distance}km`,
      payment_method: orderData.payment_method,
      has_promotion: !!selectedPromotion
    });

    // Send to main backend
    try {
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:1310/orders', orderData)
      );

      this.logger.log(
        `✅ Order created successfully! Status: ${response.status} | Order for: ${customer.first_name} ${customer.last_name} from ${restaurant.restaurant_name || restaurant.name}`
      );

      // Log order details for debugging
      this.logger.log(`📋 Order Details:`, {
        orderId: response.data?.data?.id || 'N/A',
        customer_id: orderData.customer_id,
        restaurant_id: orderData.restaurant_id,
        total_amount: orderData.total_amount,
        items: orderItems.map(item => `${item.name} x${item.quantity}`)
      });
    } catch (error) {
      this.logger.error(`❌ Failed to create order: ${error.message}`);

      if (error.response?.data) {
        this.logger.error(
          '📄 Error details:',
          JSON.stringify(error.response.data, null, 2)
        );
      }

      // Log the order data that failed for debugging
      this.logger.error(
        '📋 Failed order data:',
        JSON.stringify(orderData, null, 2)
      );
    }
  }
}
