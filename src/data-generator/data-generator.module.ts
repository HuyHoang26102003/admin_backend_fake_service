import { Module } from '@nestjs/common';
import { UserGeneratorService } from './user-generator.service';
import { RestaurantGeneratorService } from './restaurant-generator.service';
import { CustomerCareGeneratorService } from './customer-care-generator.service';
import { OrderGeneratorService } from './order-generator.service';
import { DataPreparationService } from './data-preparation.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ScheduleModule.forRoot(), HttpModule],
  providers: [
    DataPreparationService,
    UserGeneratorService,
    RestaurantGeneratorService,
    CustomerCareGeneratorService,
    OrderGeneratorService
  ]
})
export class DataGeneratorModule {}
