// fake-backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataGeneratorModule } from './data-generator/data-generator.module';

@Module({
  imports: [DataGeneratorModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
