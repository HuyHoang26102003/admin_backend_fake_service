import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { faker } from '@faker-js/faker';

// Define our own AppTheme enum since we couldn't access the original
enum AppTheme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM'
}

@Injectable()
export class UserGeneratorService {
  private readonly logger = new Logger(UserGeneratorService.name);

  constructor(private readonly httpService: HttpService) {}

  @Interval(60000) // Generate fake users every minute (60 seconds)
  generateAndSendUsers() {
    // Randomly decide whether to create a customer or driver (70% customer, 30% driver)
    const createCustomer = Math.random() < 0.7;

    if (createCustomer) {
      this.generateAndSendCustomer();
    } else {
      this.generateAndSendDriver();
    }
  }

  private generateAndSendCustomer() {
    const userId = faker.string.uuid();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const hasAvatar = Math.random() > 0.3;

    // Create customer signup data
    const customerSignup = {
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: faker.internet.email({ firstName, lastName }),
      password: faker.internet.password(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      address_ids: [],
      preferred_category_ids: [],
      favorite_restaurant_ids: [],
      favorite_items: [],
      support_tickets: [],
      app_preferences: {
        theme: faker.helpers.arrayElement(['LIGHT', 'DARK', 'SYSTEM'])
      },
      restaurant_history: [],
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      avatar: hasAvatar
        ? {
            url: faker.image.avatar(),
            key: faker.string.uuid()
          }
        : undefined
    };

    this.logger.log('👤 Generating and sending fake customer data...');

    // Send to main backend
    this.httpService
      .post('http://localhost:1310/customers', customerSignup)
      .subscribe({
        next: response =>
          this.logger.log(
            `✅ Fake customer sent successfully! Status: ${response.status} | Name: ${firstName} ${lastName}`
          ),
        error: error =>
          this.logger.error(`❌ Failed to send fake customer: ${error.message}`)
      });
  }

  private generateAndSendDriver() {
    const userId = faker.string.uuid();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const phone = faker.phone.number();
    const hasAvatar = Math.random() > 0.3;

    // Create driver signup data
    const driverSignup = {
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: faker.internet.password(),
      phone: phone,
      contact_email: [
        {
          title: 'Primary',
          is_default: true,
          email: email
        }
      ],
      contact_phone: [
        {
          title: 'Primary',
          is_default: true,
          number: phone
        }
      ],
      vehicle: {
        license_plate: faker.vehicle.vrm(),
        model: faker.vehicle.model(),
        color: faker.vehicle.color()
      },
      current_location: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude()
      },
      available_for_work: Math.random() > 0.3, // 70% chance of being available
      is_on_delivery: false, // New drivers start not on delivery
      active_points: faker.number.int({ min: 0, max: 100 }),
      rating: {
        average_rating: faker.number.float({
          min: 3,
          max: 5,
          fractionDigits: 1
        }),
        review_count: faker.number.int({ min: 0, max: 50 })
      },
      avatar: hasAvatar
        ? {
            url: faker.image.avatar(),
            key: faker.string.uuid()
          }
        : undefined
    };

    this.logger.log('🚗 Generating and sending fake driver data...');

    // Send to main backend
    this.httpService
      .post('http://localhost:1310/drivers', driverSignup)
      .subscribe({
        next: response =>
          this.logger.log(
            `✅ Fake driver sent successfully! Status: ${response.status} | Name: ${firstName} ${lastName}`
          ),
        error: error =>
          this.logger.error(`❌ Failed to send fake driver: ${error.message}`)
      });
  }
}
