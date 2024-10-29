import { BullModule } from '@nestjs/bullmq';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from './__shared__/config/app.config';
import datasourceConfig from './__shared__/config/datasource.config';
import { GlobalExceptionFilter } from './__shared__/filters/global-exception.filter';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { MailQueueModule } from './mail-queue/mail-queue.module';
import { MailsModule } from './mails/mails.module';
import { User } from './__shared__/models/user.entity';
import { ReportsModule } from './reports/reports.module';
import { SeedData } from './seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRoot(datasourceConfig.options),
    AuthModule,
    EmployeeModule,
    AttendanceModule,
    MailsModule,
    MailQueueModule,
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    TypeOrmModule.forFeature([User]),
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    SeedData,
  ],
})
export class AppModule {}
