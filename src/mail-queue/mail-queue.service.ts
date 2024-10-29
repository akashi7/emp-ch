import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailsService } from 'src/mails/mails.service';

@Processor('mailQueue')
@Injectable()
export class MailQueueService extends WorkerHost {
  constructor(private readonly mailService: MailsService) {
    super();
  }

  async process(job: Job) {
    return this.handleSendEmail(job);
  }

  private async handleSendEmail(job: Job) {
    const { email, subject, from, context, template } = job.data;
    await this.mailService.sendMail(email, subject, from, context, template);
  }
}
