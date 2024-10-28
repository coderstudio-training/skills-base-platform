import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import * as handlebars from 'handlebars';
import { createTransport, Transporter } from 'nodemailer';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private adminEmails: string[];
  private readonly logger = new Logger(EmailService.name);


  constructor() {
    this.transporter = this.createTransporter();
    this.adminEmails = this.getAdminEmails();
  }

  private createTransporter(): Transporter {
    return createTransport({
      host: 'localhost', 
      port: 1025,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private getAdminEmails(): string[] {
    const emails = process.env.ADMIN_EMAILS;
    if (!emails) {
      throw new Error('Admin email/s not found');
    }
    return emails.split(',').map((email) => email.trim());
  }

  private async getEmailTemplate(templateName: string, data: any): Promise<string> {
    this.logger.log("Loading email templates...");
    try {
      const templatePath = join(__dirname,'..', 'src/templates', `${templateName}.html`);
      const templateSource = readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      this.logger.error(`Failed to load email template: ${templateName}`, error.stack);
      throw new InternalServerErrorException(`Error loading template: ${templateName}`);
    }
  }

  async sendSuccessEmail(workflowName: string): Promise<void> {
    this.logger.log("Sending success email...")
    try {
      const html = await this.getEmailTemplate('success-email-template', {workflowName });
      const mailOptions = {
        from: 'stratpoint@gmail.com',
        to: this.adminEmails.join(','),
        subject: 'Workflow Successful!',
        html: html,
      };
      await this.transporter.sendMail(mailOptions);
      this.logger.log("Success email sent successfully");
    } catch (error) {
      this.logger.error(`Failed to send success email for workflow: ${workflowName}`, error.stack);
      throw new InternalServerErrorException('Failed to send success email.');
    }
  }

  async sendErrorEmail(error: string, workflowName: string): Promise<void> {
    this.logger.log("Sending error email...")
    try {
      const html = await this.getEmailTemplate('error-email-template', { error, workflowName });
      const mailOptions = {
        from: 'stratpoint@gmail.com',
        to: this.adminEmails.join(','),
        subject: 'Workflow Failed!',
        html: html,
      };
      await this.transporter.sendMail(mailOptions);
      this.logger.log("Error email sent successfully")
    } catch (sendError) {
      this.logger.error(`Failed to send failure email for workflow: ${workflowName}`, sendError.stack);
      throw new InternalServerErrorException('Failed to send fail email.');
    }
  }

  async sendEmail(to: string, subject: string, templateName: string, data: any): Promise<void> {
    const html = await this.getEmailTemplate(templateName, data);
    const mailOptions = {
      from: 'stratpoint@gmail.com',
      to: to,
      subject: subject,
      html: html,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = await this.getEmailTemplate('welcome-email-template', { name });
    const mailOptions = {
      from: 'stratpoint@gmail.com',
      to: to,
      subject: 'Welcome!',
      html: html,
    };
    await this.transporter.sendMail(mailOptions);
  }

  getEmailTemplates(): string[] {
    const templateDir = join(__dirname, '..', 'src/templates');
    return readdirSync(templateDir).filter((file) => file.endsWith('.html')).map((file) => file.replace('.html', ''));
  }

  createEmailTemplate(templateName: string, content: string): void {
    const templatePath = join(__dirname, '..', 'src/templates', `${templateName}.html`);
    if (existsSync(templatePath)) {
      throw new Error(`Template ${templateName} already exists`);
    }
    writeFileSync(templatePath, content);
  }

  updateEmailTemplate(templateName: string, content: string): void {
    const templatePath = join(__dirname, '..', 'src/templates', `${templateName}.html`);
    if (!existsSync(templatePath)) {
      throw new NotFoundException(`Template ${templateName} not found`);
    }
    writeFileSync(templatePath, content);
  }

  deleteEmailTemplate(templateName: string): void {
    const templatePath = join(__dirname, '..', 'src/templates', `${templateName}.html`);
    if (!existsSync(templatePath)) {
      throw new NotFoundException(`Template ${templateName} not found`);
    }
    unlinkSync(templatePath);
  }

  async renderTemplate(templateName: string, data: any): Promise<string> {
    return this.getEmailTemplate(templateName, data);
  }
}
