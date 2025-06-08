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

  private async generateAndSendCustomer() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const phone = faker.phone.number();
    const hasAvatar = Math.random() > 0.3;

    this.logger.log('👤 Generating and sending fake customer data...');

    try {
      // Step 1: Create a user first with CUSTOMER role
      const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: faker.internet.password({ length: 8 }),
        phone: phone,
        user_type: ['CUSTOMER'],
        address: [],
        avatar: hasAvatar
          ? {
              url: faker.image.avatar(),
              key: faker.string.uuid()
            }
          : undefined,
        is_verified: Math.random() > 0.2
        // Removed app_preferences - not in DTO
      };

      const userResponse = await this.httpService
        .post('http://localhost:1310/users', userData)
        .toPromise();

      if (userResponse?.data?.EC !== 0) {
        this.logger.error(
          `❌ Failed to create user: ${userResponse?.data?.EM}`
        );
        return;
      }

      const createdUser = userResponse.data.data;
      this.logger.log(`✅ Created user: ${firstName} ${lastName}`);

      // Step 2: Create customer profile using the created user
      const customerData = {
        user_id: createdUser.id,
        first_name: firstName,
        last_name: lastName,
        avatar: hasAvatar
          ? {
              url: faker.image.avatar(),
              key: faker.string.uuid()
            }
          : undefined,
        address_ids: [],
        preferred_category_ids: [],
        favorite_restaurant_ids: [],
        favorite_items: [],
        support_tickets: [],
        app_preferences: {
          theme: faker.helpers.arrayElement(['light', 'dark'])
        },
        restaurant_history: [],
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000)
      };

      const customerResponse = await this.httpService
        .post('http://localhost:1310/customers', customerData)
        .toPromise();

      if (customerResponse?.data?.EC === 0) {
        this.logger.log(
          `✅ Fake customer created successfully! Name: ${firstName} ${lastName}`
        );
      } else {
        this.logger.error(
          `❌ Failed to create customer: ${customerResponse?.data?.EM}`
        );
      }
    } catch (error) {
      this.logger.error(`❌ Failed to generate customer: ${error.message}`);
    }
  }

  private async generateAndSendDriver() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const phone = faker.phone.number();
    const hasAvatar = Math.random() > 0.3;

    this.logger.log('🚗 Generating and sending fake driver data...');

    try {
      // Step 1: Create a user first with DRIVER role
      const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: faker.internet.password({ length: 8 }),
        phone: phone,
        user_type: ['DRIVER'],
        address: [],
        avatar: hasAvatar
          ? {
              url: faker.image.avatar(),
              key: faker.string.uuid()
            }
          : undefined,
        is_verified: Math.random() > 0.2
        // Removed app_preferences - not in DTO
      };

      const userResponse = await this.httpService
        .post('http://localhost:1310/users', userData)
        .toPromise();

      if (userResponse?.data?.EC !== 0) {
        this.logger.error(
          `❌ Failed to create user: ${userResponse?.data?.EM}`
        );
        return;
      }

      const createdUser = userResponse.data.data;
      this.logger.log(`✅ Created user: ${firstName} ${lastName}`);

      // Step 2: Create driver profile using the created user
      const driverData = {
        user_id: createdUser.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        license_number: faker.vehicle.vrm(),
        license_image: {
          url: faker.image.url(),
          key: faker.string.uuid()
        },
        identity_card_number: faker.string.numeric(12),
        identity_card_image: {
          url: faker.image.url(),
          key: faker.string.uuid()
        },
        avatar: hasAvatar
          ? {
              url: faker.image.avatar(),
              key: faker.string.uuid()
            }
          : undefined,
        vehicle_info: {
          type: faker.helpers.arrayElement(['MOTORBIKE', 'CAR', 'BICYCLE']),
          license_plate: faker.vehicle.vrm(),
          model: faker.vehicle.model(),
          color: faker.vehicle.color()
        },
        location: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude()
        },
        status: {
          is_active: Math.random() > 0.2,
          is_available: Math.random() > 0.3,
          is_verified: Math.random() > 0.1
        },
        rating: {
          average_rating: faker.number.float({
            min: 3.0,
            max: 5.0,
            fractionDigits: 1
          }),
          total_rating: faker.number.int({ min: 0, max: 1000 })
        },
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000)
      };

      const driverResponse = await this.httpService
        .post('http://localhost:1310/drivers', driverData)
        .toPromise();

      if (driverResponse?.data?.EC === 0) {
        this.logger.log(
          `✅ Fake driver created successfully! Name: ${firstName} ${lastName}`
        );
      } else {
        this.logger.error(
          `❌ Failed to create driver: ${driverResponse?.data?.EM}`
        );
      }
    } catch (error) {
      this.logger.error(`❌ Failed to generate driver: ${error.message}`);
    }
  }
}
