import { Body, Controller, Post } from '@nestjs/common';
import { Logger } from '@skills-base/shared';
import { EmailDto } from './dto/email.dto';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(
    private emailService: EmailService,
    private readonly logger: Logger,
  ) {
    this.logger = new Logger(EmailController.name);
  }

  @Post('workflow/success')
  async sendWorkflowSuccess(
    @Body() data: EmailDto,
  ): Promise<{ message: string }> {
    this.logger.info('Received workflow success notification', {
      workflowName: data.workflowName,
    });

    await this.emailService.sendWorkflowSuccess(data);
    return { message: 'Success email sent' };
  }

  @Post('workflow/error')
  async sendWorkflowError(
    @Body() data: EmailDto,
  ): Promise<{ message: string }> {
    this.logger.info('Received workflow error notification', {
      workflowName: data.workflowName,
    });

    await this.emailService.sendWorkflowError(data);
    return { message: 'Error email sent' };
  }
}
