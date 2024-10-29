import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { MailsService } from 'src/mails/mails.service';
import { MailQueueService } from './mail-queue.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mailQueue',
    }),
  ],
  providers: [MailQueueService, MailsService],
  exports: [MailQueueService, BullModule],
})
export class MailQueueModule {}
