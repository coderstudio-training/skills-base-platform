import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  LoggingInterceptor,
  Roles,
  RolesGuard,
  TransformInterceptor,
  UserRole,
} from '@skills-base/shared';
import { RecommendationResponseDto } from '../dto/recommendation.dto';
import { RecommendationService } from '../services/recommendation.service';

@Controller('api/learning')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('recommendations/:email')
  @Roles(UserRole.USER)
  async getRecommendations(
    @Param('email', new ValidationPipe()) email: string,
  ): Promise<RecommendationResponseDto> {
    return this.recommendationService.getRecommendations(email);
  }
}
