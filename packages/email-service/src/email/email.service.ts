import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import * as handlebars from 'handlebars';
import { createTransport, Transporter } from 'nodemailer';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = this.createTransporter();
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

  private async getEmailTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = join(__dirname,'..', 'src/templates', `${templateName}.html`);
    const templateSource = readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(data);
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

  async sendSuccessEmail(to: string, details: string, workflowName: string): Promise<void> {
    const html = await this.getEmailTemplate('success-email-template', { details, workflowName });
    const mailOptions = {
      from: 'stratpoint@gmail.com',
      to: to,
      subject: 'Workflow Successful!',
      html: html,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendErrorEmail(to: string, error: string, workflowName: string): Promise<void> {
    const html = await this.getEmailTemplate('error-email-template', { error, workflowName });
    const mailOptions = {
      from: 'stratpoint@gmail.com',
      to: to,
      subject: 'Workflow Failed!',
      html: html,
    };
    await this.transporter.sendMail(mailOptions);
  }

  // async sendWelcomeEmail(to: string, name: string): Promise<void> {
  //   await this.sendEmail(to, 'Welcome!', 'welcome', { name });
  // }

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
