import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { FailEmailDto } from './dto/fail-email.dto';
import { SuccessEmailDto } from './dto/success-email.dto';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send-success')
  async sendSuccessEmail(@Body() successEmailDto: SuccessEmailDto): Promise<{ message: string }> {
    const { workflowName } = successEmailDto;
    try {
      await this.emailService.sendSuccessEmail(workflowName);
      return { message: 'Success email sent successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to send success email.');
    }
  }

  @Post('send-error')
  async sendErrorEmail(@Body() failEmailDto: FailEmailDto): Promise<{ message: string }> {
    const { error, workflowName } = failEmailDto;
    try {
      await this.emailService.sendErrorEmail(error, workflowName);
      return { message: 'Error email sent successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to send fail email.');
    }
  }

  @Get('templates')
  getEmailTemplates(): { templates: string[] } {
    const templates = this.emailService.getEmailTemplates();
    return { templates };
  }

  @Post('templates')
  createEmailTemplate(@Body() body: { templateName: string; content: string }): { message: string } {
    const { templateName, content } = body;
    this.emailService.createEmailTemplate(templateName, content);
    return { message: 'Template created successfully' };
  }

  @Put('templates/:id')
  updateEmailTemplate(
    @Param('id') templateName: string,
    @Body() body: { content: string }
  ): { message: string } {
    const { content } = body;
    this.emailService.updateEmailTemplate(templateName, content);
    return { message: 'Template updated successfully' };
  }

  @Delete('templates/:id')
  deleteEmailTemplate(@Param('id') templateName: string): { message: string } {
    this.emailService.deleteEmailTemplate(templateName);
    return { message: 'Template deleted successfully' };
  }

  @Post('templates/render')
  async renderTemplate(
    @Body() body: { templateName: string; data: any }
  ): Promise<{ rendered: string }> {
    const { templateName, data } = body;
    const rendered = await this.emailService.renderTemplate(templateName, data);
    return { rendered };
  }
}
