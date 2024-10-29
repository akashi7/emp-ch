import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from 'src/__shared__/models/attendance.entity';
import { Employee } from 'src/__shared__/models/employee.entity';
import { User } from 'src/__shared__/models/user.entity';
import { MailQueueModule } from 'src/mail-queue/mail-queue.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Employee, User]),
    MailQueueModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
