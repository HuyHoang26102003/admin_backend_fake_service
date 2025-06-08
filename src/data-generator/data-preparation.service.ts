import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { faker } from '@faker-js/faker';
import { firstValueFrom } from 'rxjs';

interface DataCollection {
  customers: any[];
  restaurants: any[];
  addresses: any[];
  menuItems: any[];
  variants: any[];
  drivers: any[];
  promotions: any[];
  categories: any[];
}

@Injectable()
export class DataPreparationService {
  private readonly logger = new Logger(DataPreparationService.name);
  private readonly MIN_RECORDS = 10;
  private dataCache: DataCollection | null = null;
  private lastCacheTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly httpService: HttpService) {}

  async ensureDataAvailability(): Promise<DataCollection> {
    // Check cache first
    if (
      this.dataCache &&
      Date.now() - this.lastCacheTime < this.CACHE_DURATION
    ) {
      this.logger.log(' Using cached data collection');
      return this.dataCache;
    }

    this.logger.log(' Starting comprehensive data preparation process...');

    try {
      // Step 1: Create independent entities first
      this.logger.log(' Step 1: Creating independent entities...');

      const users = await this.ensureMinimumRecords('users', () =>
        this.generateUser()
      );

      // Step 2: Create address books
      this.logger.log(' Step 2: Creating address books...');
      const addresses = await this.ensureMinimumRecords('address_books', () =>
        this.generateAddressBook()
      );

      // Step 3: Create food categories
      this.logger.log(' Step 3: Creating food categories...');
      const categories = await this.ensureMinimumRecords(
        'food-categories',
        () => this.generateFoodCategory()
      );

      // Step 4: Create customers (needs users, can reference addresses)
      this.logger.log(' Step 4: Creating customers...');
      const customers = await this.ensureMinimumCustomers(users, addresses);

      // Step 5: Create restaurants (needs users + addresses + categories)
      this.logger.log(' Step 5: Creating restaurants...');
      const restaurants = await this.ensureMinimumRestaurants(
        users,
        addresses,
        categories
      );

      // Step 6: Create drivers (needs users)
      this.logger.log(' Step 6: Creating drivers...');
      const drivers = await this.ensureMinimumDrivers(users);

      // Step 7: Create menu items (needs restaurants + categories)
      this.logger.log(' Step 7: Creating menu items...');
      const menuItems = await this.ensureMinimumMenuItems(
        restaurants,
        categories
      );

      // Step 8: Create variants (needs menu items)
      this.logger.log(' Step 8: Creating menu item variants...');
      const variants = await this.ensureMinimumVariants(menuItems);

      // Step 9: Create promotions (can reference categories)
      this.logger.log(' Step 9: Creating promotions...');
      const promotions = await this.ensureMinimumPromotions(categories);

      const dataCollection: DataCollection = {
        customers,
        restaurants,
        drivers,
        addresses,
        menuItems,
        variants,
        promotions,
        categories
      };

      // Cache the result
      this.dataCache = dataCollection;
      this.lastCacheTime = Date.now();

      this.logger.log(' Data preparation completed successfully!');
      this.logger.log(' Data Collection Summary:');
      this.logger.log(` Users: ${users.length}`);
      this.logger.log(` Addresses: ${addresses.length}`);
      this.logger.log(` Categories: ${categories.length}`);
      this.logger.log(` Customers: ${customers.length}`);
      this.logger.log(` Restaurants: ${restaurants.length}`);
      this.logger.log(` Drivers: ${drivers.length}`);
      this.logger.log(` Menu Items: ${menuItems.length}`);
      this.logger.log(` Variants: ${variants.length}`);
      this.logger.log(` Promotions: ${promotions.length}`);

      return dataCollection;
    } catch (error) {
      this.logger.error('❌ Error in data preparation:', error.message);
      throw error;
    }
  }

  private shouldUseCachedData(): boolean {
    return (
      this.dataCache !== null &&
      Date.now() - this.lastCacheTime < this.CACHE_DURATION
    );
  }

  private async ensureMinimumRecords(
    endpoint: string,
    generator: () => any
  ): Promise<any[]> {
    this.logger.log(` Checking ${endpoint}...`);

    try {
      // Fetch existing records
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:1310/${endpoint}`)
      );

      // Parse the ApiResponse structure correctly
      const apiResponse = response.data;
      if (apiResponse.EC !== 0) {
        this.logger.error(`API Error for ${endpoint}: ${apiResponse.EM}`);
        return [];
      }

      const existingRecords = apiResponse.data || [];
      this.logger.log(`Found ${existingRecords.length} existing ${endpoint}`);

      // Calculate how many we need to generate
      const needed = Math.max(0, this.MIN_RECORDS - existingRecords.length);

      if (needed === 0) {
        this.logger.log(
          `✅ ${endpoint} has sufficient records (${existingRecords.length})`
        );
        return existingRecords;
      }

      this.logger.log(` Generating ${needed} additional ${endpoint}...`);

      // Generate missing records
      for (let i = 0; i < needed; i++) {
        try {
          const newRecord = generator();
          const createResponse = await firstValueFrom(
            this.httpService.post(
              `http://localhost:1310/${endpoint}`,
              newRecord
            )
          );

          // Check if creation was successful
          const createApiResponse = createResponse.data;
          if (createApiResponse.EC === 0) {
            this.logger.log(`✅ Created ${endpoint} ${i + 1}/${needed}`);
          } else {
            this.logger.warn(
              `Failed to create ${endpoint} ${i + 1}/${needed}: ${createApiResponse.EM}`
            );
          }

          // Small delay to avoid overwhelming the server
          await this.delay(100);
        } catch (error) {
          this.logger.warn(`Failed to create ${endpoint}: ${error.message}`);
        }
      }

      // Fetch updated list
      const updatedResponse = await firstValueFrom(
        this.httpService.get(`http://localhost:1310/${endpoint}`)
      );

      const updatedApiResponse = updatedResponse.data;
      if (updatedApiResponse.EC !== 0) {
        this.logger.error(
          `API Error fetching updated ${endpoint}: ${updatedApiResponse.EM}`
        );
        return existingRecords;
      }

      const finalRecords = updatedApiResponse.data || [];

      this.logger.log(` ${endpoint} now has ${finalRecords.length} records`);
      return finalRecords;
    } catch (error) {
      this.logger.error(`❌ Error ensuring ${endpoint}:`, error.message);
      return [];
    }
  }

  private async ensureMinimumMenuItems(
    restaurants: any[],
    categories: any[]
  ): Promise<any[]> {
    this.logger.log(' Checking menu items...');

    try {
      const response = await firstValueFrom(
        this.httpService.get('http://localhost:1310/menu-items')
      );

      const apiResponse = response.data;
      if (apiResponse.EC !== 0) {
        this.logger.error(`API Error for menu items: ${apiResponse.EM}`);
        return [];
      }

      const existingMenuItems = apiResponse.data || [];
      this.logger.log(`Found ${existingMenuItems.length} existing menu items`);

      const needed = Math.max(0, this.MIN_RECORDS - existingMenuItems.length);

      if (needed === 0) {
        return existingMenuItems;
      }

      // Only generate menu items if we have restaurants and categories
      if (restaurants.length === 0 || categories.length === 0) {
        this.logger.warn(
          'Cannot generate menu items: no restaurants or categories available'
        );
        return existingMenuItems;
      }

      this.logger.log(` Generating ${needed} additional menu items...`);

      for (let i = 0; i < needed; i++) {
        try {
          const restaurant = faker.helpers.arrayElement(restaurants);
          const category = faker.helpers.arrayElement(categories);

          const newMenuItem = this.generateMenuItem(restaurant, category);

          const createResponse = await firstValueFrom(
            this.httpService.post(
              'http://localhost:1310/menu-items',
              newMenuItem
            )
          );

          const createApiResponse = createResponse.data;
          if (createApiResponse.EC === 0) {
            this.logger.log(`✅ Created menu item ${i + 1}/${needed}`);
          } else {
            this.logger.warn(
              `Failed to create menu item ${i + 1}/${needed}: ${createApiResponse.EM}`
            );
          }

          await this.delay(100);
        } catch (error) {
          this.logger.warn(`Failed to create menu item: ${error.message}`);
        }
      }

      // Fetch updated list
      const updatedResponse = await firstValueFrom(
        this.httpService.get('http://localhost:1310/menu-items')
      );

      const updatedApiResponse = updatedResponse.data;
      if (updatedApiResponse.EC !== 0) {
        this.logger.error(
          `API Error fetching updated menu items: ${updatedApiResponse.EM}`
        );
        return existingMenuItems;
      }

      const finalMenuItems = updatedApiResponse.data || [];

      this.logger.log(` Menu items now has ${finalMenuItems.length} records`);
      return finalMenuItems;
    } catch (error) {
      this.logger.error('❌ Error ensuring menu items:', error.message);
      return [];
    }
  }

  private async ensureMinimumVariants(menuItems: any[]): Promise<any[]> {
    this.logger.log(' Checking menu item variants...');

    try {
      const response = await firstValueFrom(
        this.httpService.get('http://localhost:1310/menu-item-variants')
      );

      const apiResponse = response.data;
      if (apiResponse.EC !== 0) {
        this.logger.error(`API Error for variants: ${apiResponse.EM}`);
        return [];
      }

      const existingVariants = apiResponse.data || [];
      this.logger.log(`Found ${existingVariants.length} existing variants`);

      const needed = Math.max(0, this.MIN_RECORDS - existingVariants.length);

      if (needed === 0) {
        return existingVariants;
      }

      // Only generate variants if we have menu items
      if (menuItems.length === 0) {
        this.logger.warn('Cannot generate variants: no menu items available');
        return existingVariants;
      }

      this.logger.log(` Generating ${needed} additional variants...`);

      for (let i = 0; i < needed; i++) {
        try {
          const menuItem = faker.helpers.arrayElement(menuItems);
          const newVariant = this.generateMenuItemVariant(menuItem);

          const createResponse = await firstValueFrom(
            this.httpService.post(
              'http://localhost:1310/menu-item-variants',
              newVariant
            )
          );

          const createApiResponse = createResponse.data;
          if (createApiResponse.EC === 0) {
            this.logger.log(`✅ Created variant ${i + 1}/${needed}`);
          } else {
            this.logger.warn(
              `Failed to create variant ${i + 1}/${needed}: ${createApiResponse.EM}`
            );
          }

          await this.delay(100);
        } catch (error) {
          this.logger.warn(`Failed to create variant: ${error.message}`);
        }
      }

      // Fetch updated list
      const updatedResponse = await firstValueFrom(
        this.httpService.get('http://localhost:1310/menu-item-variants')
      );

      const updatedApiResponse = updatedResponse.data;
      if (updatedApiResponse.EC !== 0) {
        this.logger.error(
          `API Error fetching updated variants: ${updatedApiResponse.EM}`
        );
        return existingVariants;
      }

      const finalVariants = updatedApiResponse.data || [];

      this.logger.log(` Variants now has ${finalVariants.length} records`);
      return finalVariants;
    } catch (error) {
      this.logger.error('❌ Error ensuring variants:', error.message);
      return [];
    }
  }

  private async ensureMinimumPromotions(categories: any[]): Promise<any[]> {
    this.logger.log(' Checking promotions...');

    try {
      const response = await firstValueFrom(
        this.httpService.get('http://localhost:1310/promotions')
      );

      const apiResponse = response.data;
      if (apiResponse.EC !== 0) {
        this.logger.error(`API Error for promotions: ${apiResponse.EM}`);
        return [];
      }

      const existingPromotions = apiResponse.data || [];
      this.logger.log(`Found ${existingPromotions.length} existing promotions`);

      const needed = Math.max(0, this.MIN_RECORDS - existingPromotions.length);

      if (needed === 0) {
        return existingPromotions;
      }

      this.logger.log(` Generating ${needed} additional promotions...`);

      for (let i = 0; i < needed; i++) {
        try {
          const newPromotion = this.generatePromotion(categories);

          const createResponse = await firstValueFrom(
            this.httpService.post(
              'http://localhost:1310/promotions',
              newPromotion
            )
          );

          const createApiResponse = createResponse.data;
          if (createApiResponse.EC === 0) {
            this.logger.log(` Created promotion ${i + 1}/${needed}`);
          } else {
            this.logger.warn(
              `Failed to create promotion ${i + 1}/${needed}: ${createApiResponse.EM}`
            );
          }

          await this.delay(100);
        } catch (error) {
          this.logger.warn(`Failed to create promotion: ${error.message}`);
        }
      }

      // Fetch updated list
      const updatedResponse = await firstValueFrom(
        this.httpService.get('http://localhost:1310/promotions')
      );

      const updatedApiResponse = updatedResponse.data;
      if (updatedApiResponse.EC !== 0) {
        this.logger.error(
          `API Error fetching updated promotions: ${updatedApiResponse.EM}`
        );
        return existingPromotions;
      }

      const finalPromotions = updatedApiResponse.data || [];

      this.logger.log(` Promotions now has ${finalPromotions.length} records`);
      return finalPromotions;
    } catch (error) {
      this.logger.error('❌ Error ensuring promotions:', error.message);
      return [];
    }
  }

  // Data generators
  private generateUser(): any {
    // Generate different user types based on probability
    const userTypes = [];
    const rand = Math.random();

    if (rand < 0.6) {
      userTypes.push('CUSTOMER');
    } else if (rand < 0.8) {
      userTypes.push('DRIVER');
    } else if (rand < 0.9) {
      userTypes.push('RESTAURANT_OWNER');
    } else {
      userTypes.push('CUSTOMER_CARE_REPRESENTATIVE');
    }

    return {
      first_name: faker.person.firstName(), // Required string
      last_name: faker.person.lastName(), // Required string
      email: faker.internet.email(), // Required email string
      password: faker.internet.password({ length: 8 }), // Required string
      phone: faker.phone.number(), // Optional string
      user_type: userTypes, // Required array of UserType enum values
      address: [], // Optional string array
      avatar:
        Math.random() > 0.3
          ? {
              // Optional object
              url: faker.image.avatar(),
              key: faker.string.uuid()
            }
          : undefined,
      is_verified: Math.random() > 0.2 // Optional boolean
      // Removed app_preferences - not in user DTO
    };
  }

  private generateCustomerUser(): any {
    // Generate a user specifically for customers
    return {
      first_name: faker.person.firstName(), // Required string
      last_name: faker.person.lastName(), // Required string
      email: faker.internet.email(), // Required email string
      password: faker.internet.password({ length: 8 }), // Required string
      phone: faker.phone.number(), // Optional string
      user_type: ['CUSTOMER'], // Required array - specifically CUSTOMER
      address: [], // Optional string array
      avatar:
        Math.random() > 0.3
          ? {
              // Optional object
              url: faker.image.avatar(),
              key: faker.string.uuid()
            }
          : undefined,
      is_verified: Math.random() > 0.2 // Optional boolean
      // Removed app_preferences - not in user DTO
    };
  }

  private generateAddressBook(): any {
    return {
      street: faker.location.streetAddress(), // Required string
      city: faker.location.city(), // Required string
      nationality: faker.location.country(), // Required string
      is_default: Math.random() > 0.7, // Optional boolean
      created_at: Math.floor(Date.now() / 1000), // Integer unix timestamp
      updated_at: Math.floor(Date.now() / 1000), // Integer unix timestamp
      postal_code: String(faker.number.int({ min: 10000, max: 99999 })), // String postal code
      location: {
        // Location object
        lat: faker.location.latitude(),
        lng: faker.location.longitude()
      },
      title: faker.helpers.arrayElement([
        'Home',
        'Work',
        'Restaurant',
        'Office',
        'Other'
      ]) // String title
    };
  }

  private generateCustomer(user?: any, addresses?: any[]): any {
    if (!user) {
      // Fallback for when no user is provided (shouldn't happen now)
      user = {
        id: faker.string.uuid(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        phone: faker.phone.number(),
        email: faker.internet.email()
      };
    }

    // Optionally reference existing addresses - ensure they are strings
    const addressIds =
      addresses && addresses.length > 0 && Math.random() > 0.5
        ? [String(faker.helpers.arrayElement(addresses).id)]
        : [];

    return {
      user_id: String(user.id), // Ensure it's a string
      first_name: String(user.first_name || faker.person.firstName()), // Required string
      last_name: String(user.last_name || faker.person.lastName()), // Required string
      avatar:
        Math.random() > 0.3
          ? {
              url: faker.image.avatar(),
              key: faker.string.uuid()
            }
          : undefined,
      address_ids: addressIds, // Optional string array
      preferred_category_ids: [], // Optional string array
      favorite_restaurant_ids: [], // Optional string array
      favorite_items: [], // Optional string array
      support_tickets: [], // Optional string array
      app_preferences: {
        // Optional object
        theme: faker.helpers.arrayElement(['light', 'dark'])
      },
      restaurant_history: [], // Optional array
      created_at: Math.floor(Date.now() / 1000), // Optional integer (unix timestamp)
      updated_at: Math.floor(Date.now() / 1000) // Optional integer (unix timestamp)
    };
  }

  private generateDriver(user?: any): any {
    if (!user) {
      // Fallback for when no user is provided (shouldn't happen now)
      user = {
        id: faker.string.uuid(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number()
      };
    }

    return {
      user_id: String(user.id), // Ensure it's a string
      first_name: String(user.first_name || faker.person.firstName()),
      last_name: String(user.last_name || faker.person.lastName()),
      email: String(user.email || faker.internet.email()),
      phone: String(user.phone || faker.phone.number()),
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
      avatar:
        Math.random() > 0.3
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
  }

  private generateFoodCategory(): any {
    const categoryNames = [
      'Fast Food',
      'Italian',
      'Chinese',
      'Thai',
      'Indian',
      'Mexican',
      'Japanese',
      'Korean',
      'Vietnamese',
      'Mediterranean',
      'American',
      'Seafood',
      'Vegetarian',
      'Vegan',
      'Desserts',
      'Beverages',
      'Pizza',
      'Burgers',
      'Sushi',
      'BBQ'
    ];

    return {
      name: faker.helpers.arrayElement(categoryNames), // Required string
      description: faker.commerce.productDescription(), // Required string
      avatar:
        Math.random() > 0.3
          ? {
              // Optional object
              url: faker.image.url(),
              key: faker.string.uuid()
            }
          : undefined
    };
  }

  private generateMenuItem(restaurant: any, category: any): any {
    return {
      restaurant_id: restaurant.id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 20, max: 200 })),
      category: [category.id],
      avatar:
        Math.random() > 0.3
          ? {
              url: faker.image.url(),
              key: faker.string.uuid()
            }
          : undefined,
      availability: Math.random() > 0.1,
      suggest_notes:
        Math.random() > 0.5
          ? [
              faker.helpers.arrayElement([
                'Spicy',
                'No onions',
                'Extra sauce',
                'Less salt'
              ])
            ]
          : undefined
    };
  }

  private generateMenuItemVariant(menuItem: any): any {
    return {
      menu_id: menuItem.id,
      variant: faker.helpers.arrayElement([
        'Small',
        'Medium',
        'Large',
        'Extra Large'
      ]),
      description: faker.lorem.sentence(),
      avatar:
        Math.random() > 0.5
          ? {
              url: faker.image.url(),
              key: faker.string.uuid()
            }
          : undefined,
      availability: Math.random() > 0.1,
      default_restaurant_notes:
        Math.random() > 0.5
          ? [
              faker.helpers.arrayElement([
                'Spicy',
                'No onions',
                'Extra sauce',
                'Less salt'
              ])
            ]
          : undefined,
      price: parseFloat(
        faker.commerce.price({
          min: (menuItem.price || 20) * 0.8,
          max: (menuItem.price || 20) * 1.5
        })
      ),
      discount_rate:
        Math.random() > 0.7
          ? faker.number.float({ min: 5, max: 20 })
          : undefined
    };
  }

  private generatePromotion(categories: any[]): any {
    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 30 * 24 * 60 * 60; // 30 days from now

    return {
      title: faker.commerce.productAdjective() + ' Deal',
      description: faker.lorem.sentence(),
      discount_type: faker.helpers.arrayElement(['PERCENTAGE', 'FIXED']),
      discount_value: faker.number.float({ min: 5, max: 50 }),
      minimum_order_value: parseFloat(
        faker.commerce.price({ min: 50, max: 200 })
      ),
      maximum_discount_amount: parseFloat(
        faker.commerce.price({ min: 20, max: 100 })
      ),
      usage_limit: faker.number.int({ min: 100, max: 1000 }),
      usage_count: 0,
      start_date: startDate,
      end_date: endDate,
      status: 'ACTIVE',
      food_category_ids: faker.helpers.arrayElements(
        categories.map(c => c.id),
        faker.number.int({ min: 1, max: 3 })
      ),
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logDataSummary(data: DataCollection): void {
    this.logger.log(' Data Collection Summary:');
    this.logger.log(` Customers: ${data.customers.length}`);
    this.logger.log(` Restaurants: ${data.restaurants.length}`);
    this.logger.log(` Drivers: ${data.drivers.length}`);
    this.logger.log(` Addresses: ${data.addresses.length}`);
    this.logger.log(` Menu Items: ${data.menuItems.length}`);
    this.logger.log(` Variants: ${data.variants.length}`);
    this.logger.log(` Promotions: ${data.promotions.length}`);
    this.logger.log(` Categories: ${data.categories.length}`);
  }

  // Public method to get cached data without regeneration
  getCachedData(): DataCollection | null {
    return this.dataCache;
  }

  // Public method to clear cache
  clearCache(): void {
    this.dataCache = null;
    this.lastCacheTime = 0;
    this.logger.log(' Data cache cleared');
  }

  private async ensureMinimumRestaurants(
    users: any[],
    addresses: any[],
    categories: any[]
  ): Promise<any[]> {
    this.logger.log(' Checking restaurants...');

    try {
      const response = await firstValueFrom(
        this.httpService.get('http://localhost:1310/restaurants')
      );

      const apiResponse = response.data;
      if (apiResponse.EC !== 0) {
        this.logger.error(`API Error for restaurants: ${apiResponse.EM}`);
        return [];
      }

      const existingRestaurants = apiResponse.data || [];
      this.logger.log(
        `Found ${existingRestaurants.length} existing restaurants`
      );

      const needed = Math.max(0, this.MIN_RECORDS - existingRestaurants.length);

      if (needed === 0) {
        return existingRestaurants;
      }

      // Only generate restaurants if we have all dependencies
      if (
        users.length === 0 ||
        addresses.length === 0 ||
        categories.length === 0
      ) {
        this.logger.warn(
          'Cannot generate restaurants: missing dependencies (users, addresses, or categories)'
        );
        return existingRestaurants;
      }

      this.logger.log(` Generating ${needed} additional restaurants...`);

      for (let i = 0; i < needed; i++) {
        try {
          const user = faker.helpers.arrayElement(users);
          const address = faker.helpers.arrayElement(addresses);
          const restaurantData = this.generateRestaurant(
            user,
            address,
            categories
          );

          const createResponse = await firstValueFrom(
            this.httpService.post(
              'http://localhost:1310/restaurants',
              restaurantData
            )
          );

          const createApiResponse = createResponse.data;
          if (createApiResponse.EC === 0) {
            this.logger.log(
              `✅ Created restaurant ${i + 1}/${needed}: ${restaurantData.restaurant_name}`
            );
          } else {
            this.logger.warn(
              `Failed to create restaurant ${i + 1}/${needed}: ${createApiResponse.EM}`
            );
          }

          await this.delay(100);
        } catch (error) {
          this.logger.warn(`Failed to create restaurant: ${error.message}`);
        }
      }

      // Fetch updated list
      const updatedResponse = await firstValueFrom(
        this.httpService.get('http://localhost:1310/restaurants')
      );

      const updatedApiResponse = updatedResponse.data;
      if (updatedApiResponse.EC !== 0) {
        this.logger.error(
          `API Error fetching updated restaurants: ${updatedApiResponse.EM}`
        );
        return existingRestaurants;
      }

      const finalRestaurants = updatedApiResponse.data || [];

      this.logger.log(
        `🎉 Restaurants now has ${finalRestaurants.length} records`
      );
      return finalRestaurants;
    } catch (error) {
      this.logger.error('❌ Error ensuring restaurants:', error.message);
      return [];
    }
  }

  private async ensureMinimumCustomers(
    users: any[],
    addresses: any[]
  ): Promise<any[]> {
    this.logger.log(' Checking customers...');

    try {
      const response = await firstValueFrom(
        this.httpService.get('http://localhost:1310/customers')
      );

      const apiResponse = response.data;
      if (apiResponse.EC !== 0) {
        this.logger.error(`API Error for customers: ${apiResponse.EM}`);
        return [];
      }

      const existingCustomers = apiResponse.data || [];
      this.logger.log(`Found ${existingCustomers.length} existing customers`);

      const needed = Math.max(0, this.MIN_RECORDS - existingCustomers.length);

      if (needed === 0) {
        return existingCustomers;
      }

      this.logger.log(` Generating ${needed} additional customers...`);

      for (let i = 0; i < needed; i++) {
        try {
          // First, create a user specifically for this customer with CUSTOMER role
          const customerUser = this.generateCustomerUser();

          // Create the user first
          const userResponse = await firstValueFrom(
            this.httpService.post('http://localhost:1310/users', customerUser)
          );

          const userApiResponse = userResponse.data;
          if (userApiResponse.EC !== 0) {
            this.logger.warn(
              `Failed to create user for customer: ${userApiResponse.EM}`
            );
            continue;
          }

          const createdUser = userApiResponse.data;
          this.logger.log(
            `✅ Created user for customer: ${createdUser.first_name} ${createdUser.last_name}`
          );

          // Now create the customer with the created user
          const customerData = this.generateCustomer(createdUser, addresses);

          const createResponse = await firstValueFrom(
            this.httpService.post(
              'http://localhost:1310/customers',
              customerData
            )
          );

          const createApiResponse = createResponse.data;
          if (createApiResponse.EC === 0) {
            this.logger.log(
              `✅ Created customer ${i + 1}/${needed}: ${customerData.first_name} ${customerData.last_name}`
            );
          } else {
            this.logger.warn(
              `Failed to create customer ${i + 1}/${needed}: ${createApiResponse.EM}`
            );
          }

          await this.delay(200); // Increased delay to avoid overwhelming the server
        } catch (error) {
          this.logger.warn(`Failed to create customer: ${error.message}`);
        }
      }

      // Fetch updated list
      const updatedResponse = await firstValueFrom(
        this.httpService.get('http://localhost:1310/customers')
      );

      const updatedApiResponse = updatedResponse.data;
      if (updatedApiResponse.EC !== 0) {
        this.logger.error(
          `API Error fetching updated customers: ${updatedApiResponse.EM}`
        );
        return existingCustomers;
      }

      const finalCustomers = updatedApiResponse.data || [];

      this.logger.log(` Customers now has ${finalCustomers.length} records`);
      return finalCustomers;
    } catch (error) {
      this.logger.error('❌ Error ensuring customers:', error.message);
      return [];
    }
  }

  private async ensureMinimumDrivers(users: any[]): Promise<any[]> {
    this.logger.log(' Checking drivers...');

    try {
      const response = await firstValueFrom(
        this.httpService.get('http://localhost:1310/drivers')
      );

      const apiResponse = response.data;
      if (apiResponse.EC !== 0) {
        this.logger.error(`API Error for drivers: ${apiResponse.EM}`);
        return [];
      }

      const existingDrivers = apiResponse.data || [];
      this.logger.log(`Found ${existingDrivers.length} existing drivers`);

      const needed = Math.max(0, this.MIN_RECORDS - existingDrivers.length);

      if (needed === 0) {
        return existingDrivers;
      }

      // Only generate drivers if we have users
      if (users.length === 0) {
        this.logger.warn('Cannot generate drivers: no users available');
        return existingDrivers;
      }

      this.logger.log(` Generating ${needed} additional drivers...`);

      for (let i = 0; i < needed; i++) {
        try {
          const user = faker.helpers.arrayElement(users);
          const driverData = this.generateDriver(user);

          const createResponse = await firstValueFrom(
            this.httpService.post('http://localhost:1310/drivers', driverData)
          );

          const createApiResponse = createResponse.data;
          if (createApiResponse.EC === 0) {
            this.logger.log(`✅ Created driver ${i + 1}/${needed}`);
          } else {
            this.logger.warn(
              `Failed to create driver ${i + 1}/${needed}: ${createApiResponse.EM}`
            );
          }

          await this.delay(100);
        } catch (error) {
          this.logger.warn(`Failed to create driver: ${error.message}`);
        }
      }

      // Fetch updated list
      const updatedResponse = await firstValueFrom(
        this.httpService.get('http://localhost:1310/drivers')
      );

      const updatedApiResponse = updatedResponse.data;
      if (updatedApiResponse.EC !== 0) {
        this.logger.error(
          `API Error fetching updated drivers: ${updatedApiResponse.EM}`
        );
        return existingDrivers;
      }

      const finalDrivers = updatedApiResponse.data || [];

      this.logger.log(` Drivers now has ${finalDrivers.length} records`);
      return finalDrivers;
    } catch (error) {
      this.logger.error('❌ Error ensuring drivers:', error.message);
      return [];
    }
  }

  private generateRestaurant(
    user?: any,
    address?: any,
    categories?: any[]
  ): any {
    if (!user) {
      user = {
        id: faker.string.uuid(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number()
      };
    }

    if (!address) {
      address = { id: faker.string.uuid() };
    }

    const ownerFirstName = user.first_name || faker.person.firstName();
    const ownerLastName = user.last_name || faker.person.lastName();
    const restaurantName = faker.company.name();
    const hasAvatar = Math.random() > 0.2;

    const generateHours = () => ({
      from: faker.number.int({ min: 7, max: 11 }) * 3600,
      to: faker.number.int({ min: 19, max: 23 }) * 3600
    });

    // Use real category IDs if available
    const foodCategoryIds =
      categories && categories.length > 0
        ? faker.helpers.arrayElements(
            categories.map(cat => cat.id),
            faker.number.int({ min: 1, max: Math.min(3, categories.length) })
          )
        : [];

    return {
      owner_id: user.id,
      owner_name: `${ownerFirstName} ${ownerLastName}`,
      address_id: address.id,
      restaurant_name: restaurantName,
      description: faker.company.catchPhrase(),
      contact_email: [
        {
          title: 'Primary',
          is_default: true,
          email:
            user.email ||
            faker.internet.email({
              firstName: restaurantName.split(' ')[0],
              lastName: 'Restaurant'
            })
        }
      ],
      contact_phone: [
        {
          title: 'Primary',
          number: user.phone || faker.phone.number(),
          is_default: true
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
      promotions: [],
      ratings: {
        average_rating: faker.number.float({
          min: 3.0,
          max: 5.0,
          fractionDigits: 1
        }),
        review_count: faker.number.int({ min: 0, max: 500 })
      },
      food_category_ids: foodCategoryIds,
      opening_hours: {
        mon: generateHours(),
        tue: generateHours(),
        wed: generateHours(),
        thu: generateHours(),
        fri: generateHours(),
        sat: generateHours(),
        sun: generateHours()
      },
      first_name: ownerFirstName,
      last_name: ownerLastName,
      email:
        user.email ||
        faker.internet.email({
          firstName: ownerFirstName,
          lastName: ownerLastName
        }),
      password: faker.internet.password(),
      phone: user.phone || faker.phone.number()
    };
  }
}
