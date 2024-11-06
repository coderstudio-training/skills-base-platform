// src/courses/controllers/recommendation.controller.ts
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { RecommendationResponseDto } from '../dto/recommendation.dto';
import { SkillGapDto } from '../dto/skill-gap.dto';
import { RecommendationService } from '../services/recommendation.service';

@Controller('api/learning')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post('recommendations')
  async getRecommendations(
    @Body(new ValidationPipe({ transform: true })) skillGaps: SkillGapDto[],
  ): Promise<RecommendationResponseDto> {
    return this.recommendationService.getRecommendations(skillGaps);
  }
}
