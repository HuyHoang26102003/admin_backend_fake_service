import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { faker } from '@faker-js/faker';

@Injectable()
export class CustomerCareGeneratorService {
  private readonly logger = new Logger(CustomerCareGeneratorService.name);

  constructor(private readonly httpService: HttpService) {}

  @Interval(90000) // Generate fake customer care staff every 1.5 minutes
  generateAndSendCustomerCare() {
    // Randomly decide whether to create a customer care staff or inquiry (60% staff, 40% inquiry)
    const createStaff = Math.random() < 0.6;

    if (createStaff) {
      this.generateAndSendCustomerCareStaff();
    } else {
      this.generateAndSendCustomerCareInquiry();
    }
  }

  private generateAndSendCustomerCareStaff() {
    this.logger.log(
      '🎧 Generating and sending fake customer care staff data...'
    );

    const userId = faker.string.uuid();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const phone = faker.phone.number();
    const hasAvatar = Math.random() > 0.3;

    // Create customer care staff data
    const customerCareSignup = {
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
      assigned_tickets: [],
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      last_login:
        Math.floor(Date.now() / 1000) -
        faker.number.int({ min: 0, max: 86400 }),
      avatar: hasAvatar
        ? {
            url: faker.image.avatar(),
            key: faker.string.uuid()
          }
        : undefined,
      available_for_work: Math.random() > 0.2, // 80% chance of being available
      is_assigned: false // New staff start not assigned
    };

    // Send to main backend
    this.httpService
      .post('http://localhost:1310/customer-cares', customerCareSignup)
      .subscribe({
        next: response =>
          this.logger.log(
            `✅ Fake customer care staff sent successfully! Status: ${response.status} | Name: ${firstName} ${lastName}`
          ),
        error: error =>
          this.logger.error(
            `❌ Failed to send fake customer care staff: ${error.message}`
          )
      });
  }

  private generateAndSendCustomerCareInquiry() {
    this.logger.log('❓ Generating and sending fake customer care inquiry...');

    const issueTypes = [
      'ACCOUNT',
      'PAYMENT',
      'PRODUCT',
      'DELIVERY',
      'REFUND',
      'TECHNICAL',
      'OTHER'
    ];

    const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATE'];

    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    const resolutionTypes = [
      'REFUND',
      'REPLACEMENT',
      'INVESTIGATING',
      'ACCOUNT_FIX',
      'TECHNICAL_SUPPORT',
      'OTHER'
    ];

    // Create customer care inquiry data
    const customerCareInquiry = {
      customer_id: faker.string.uuid(),
      subject: faker.helpers.arrayElement([
        'Issue with my order',
        'Payment problem',
        'Wrong delivery',
        'Missing items',
        'Account access issue',
        'Refund request',
        'App not working',
        'Restaurant complaint'
      ]),
      description: faker.lorem.paragraph(),
      issue_type: faker.helpers.arrayElement(issueTypes),
      status: faker.helpers.arrayElement(statuses),
      order_id: Math.random() > 0.3 ? faker.string.uuid() : undefined,
      assigned_to: Math.random() > 0.5 ? faker.string.uuid() : undefined,
      assignee_type: faker.helpers.arrayElement(['ADMIN', 'CUSTOMER_CARE']),
      priority: faker.helpers.arrayElement(priorities),
      resolution_type:
        Math.random() > 0.5
          ? faker.helpers.arrayElement(resolutionTypes)
          : undefined,
      resolution_notes:
        Math.random() > 0.7 ? faker.lorem.paragraph() : undefined
    };

    // Send to main backend
    this.httpService
      .post(
        'http://localhost:1310/customer-cares-inquiries',
        customerCareInquiry
      )
      .subscribe({
        next: response =>
          this.logger.log(
            `✅ Fake inquiry sent successfully! Status: ${response.status} | Subject: ${customerCareInquiry.subject}`
          ),
        error: error =>
          this.logger.error(`❌ Failed to send fake inquiry: ${error.message}`)
      });
  }
}
