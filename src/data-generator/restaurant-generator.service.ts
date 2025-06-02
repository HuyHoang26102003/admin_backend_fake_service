import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { faker } from '@faker-js/faker';

@Injectable()
export class RestaurantGeneratorService {
  private readonly logger = new Logger(RestaurantGeneratorService.name);

  constructor(private readonly httpService: HttpService) {}

  @Interval(120000) // Generate fake restaurants every 2 minutes
  generateAndSendRestaurant() {
    this.logger.log('🏪 Generating and sending fake restaurant data...');

    const ownerId = faker.string.uuid();
    const ownerFirstName = faker.person.firstName();
    const ownerLastName = faker.person.lastName();
    const restaurantName = faker.company.name();
    const hasAvatar = Math.random() > 0.2;

    // Generate opening hours for each day
    const generateHours = () => ({
      from: faker.number.int({ min: 7, max: 11 }) * 3600, // 7 AM to 11 AM in seconds
      to: faker.number.int({ min: 19, max: 23 }) * 3600 // 7 PM to 11 PM in seconds
    });

    // Create restaurant signup data
    const restaurantSignup = {
      owner_id: ownerId,
      owner_name: `${ownerFirstName} ${ownerLastName}`,
      restaurant_name: restaurantName,
      description: faker.company.catchPhrase(),
      contact_email: [
        {
          title: 'Primary',
          is_default: true,
          email: faker.internet.email({
            firstName: restaurantName.split(' ')[0],
            lastName: 'Restaurant'
          })
        },
        {
          title: 'Secondary',
          is_default: false,
          email: faker.internet.email({
            firstName: ownerFirstName,
            lastName: ownerLastName
          })
        }
      ],
      contact_phone: [
        {
          title: 'Primary',
          number: faker.phone.number(),
          is_default: true
        },
        {
          title: 'Secondary',
          number: faker.phone.number(),
          is_default: false
        }
      ],
      avatar: hasAvatar
        ? {
            url: faker.image.avatar(),
            key: faker.string.uuid()
          }
        : undefined,
      images_gallery: Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        () => ({
          url: faker.image.avatar(),
          key: faker.string.uuid()
        })
      ),
      status: {
        is_open: Math.random() > 0.2,
        is_active: Math.random() > 0.1,
        is_accepted_orders: Math.random() > 0.3
      },
      promotions:
        Math.random() > 0.5
          ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
              faker.string.uuid()
            )
          : [],
      ratings: {
        average_rating: faker.number.float({
          min: 3.0,
          max: 5.0,
          fractionDigits: 1
        }),
        review_count: faker.number.int({ min: 0, max: 500 })
      },
      food_category_ids: Array.from(
        { length: faker.number.int({ min: 1, max: 4 }) },
        () => faker.string.uuid()
      ),
      opening_hours: {
        mon: generateHours(),
        tue: generateHours(),
        wed: generateHours(),
        thu: generateHours(),
        fri: generateHours(),
        sat: generateHours(),
        sun: generateHours()
      },
      // Additional fields for signup
      first_name: ownerFirstName,
      last_name: ownerLastName,
      email: faker.internet.email({
        firstName: ownerFirstName,
        lastName: ownerLastName
      }),
      password: faker.internet.password(),
      phone: faker.phone.number()
    };

    // Send to main backend
    this.httpService
      .post('http://localhost:1310/restaurants', restaurantSignup)
      .subscribe({
        next: response =>
          this.logger.log(
            `✅ Fake restaurant sent successfully! Status: ${response.status} | Name: ${restaurantName}`
          ),
        error: error =>
          this.logger.error(
            `❌ Failed to send fake restaurant: ${error.message}`
          )
      });
  }
}
