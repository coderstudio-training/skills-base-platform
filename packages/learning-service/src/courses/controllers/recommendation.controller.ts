import { Controller, Get, Param, ValidationPipe } from '@nestjs/common';
import { RecommendationResponseDto } from '../dto/recommendation.dto';
import { RecommendationService } from '../services/recommendation.service';

@Controller('api/learning')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('recommendations/:email')
  async getRecommendations(
    @Param('email', new ValidationPipe()) email: string,
  ): Promise<RecommendationResponseDto> {
    return this.recommendationService.getRecommendations(email);
  }
}
