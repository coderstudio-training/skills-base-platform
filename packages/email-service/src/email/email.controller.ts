import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  LoggingInterceptor,
  Roles,
  RolesGuard,
  TransformInterceptor,
  UserRole,
} from '@skills-base/shared';
import { EmailDto } from './dto/email.dto';
import { EmailService } from './email.service';

@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send-success')
  @Roles(UserRole.ADMIN)
  async sendSuccessEmail(
    @Body() emailDto: EmailDto,
  ): Promise<{ message: string }> {
    const { workflowName } = emailDto;
    try {
      await this.emailService.sendSuccessEmail(workflowName);
      return { message: 'Success email sent successfully' };
    } catch {
      throw new BadRequestException('Failed to send success email.');
    }
  }

  @Post('send-error')
  @Roles(UserRole.ADMIN)
  async sendErrorEmail(
    @Body() emailDto: EmailDto,
  ): Promise<{ message: string }> {
    const { workflowName } = emailDto;
    try {
      await this.emailService.sendErrorEmail(workflowName);
      return { message: 'Error email sent successfully' };
    } catch {
      throw new BadRequestException('Failed to send fail email.');
    }
  }
}
