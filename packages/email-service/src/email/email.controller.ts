import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() body: { to: string; name: string }): Promise<{ message: string }> {
    const { to, name } = body;
    await this.emailService.sendWelcomeEmail(to, name);
    return { message: 'Email sent successfully' };
  }

  // @Post('send')
  // async sendEmail(
  //   @Body() sendEmailDto: SendEmailDto
  // ) {
  //   const { to, subject, template, data } = sendEmailDto;
  //   return await this.emailService.sendEmail(to, subject, template, data);
  // }

  @Post('send-success')
  async sendSuccessEmail(@Body() body: { to: string; details: string; workflowName: string }): Promise<{ message: string }> {
    const { to, details, workflowName } = body;
    await this.emailService.sendSuccessEmail(to, details, workflowName);
    return { message: 'Success email sent successfully' };
  }

  @Post('send-error')
  async sendErrorEmail(@Body() body: { to: string; error: string; workflowName: string }): Promise<{ message: string }> {
    const { to, error, workflowName } = body;
    await this.emailService.sendErrorEmail(to, error, workflowName);
    return { message: 'Error email sent successfully' };
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
