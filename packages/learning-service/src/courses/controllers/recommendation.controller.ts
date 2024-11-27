import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOAuth2,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Learning')
@Controller('api/learning')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@ApiOAuth2(['email', 'profile'], 'google-oauth2') // Specify OAuth2 for staff/manager endpoints
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('recommendations/:email')
  @Roles(UserRole.USER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get learning recommendations',
    description: `
      Get personalized learning recommendations based on skill gaps for a specific user.
      
      Authentication:
      - This endpoint requires Google OAuth authentication
      - Access through the frontend application for proper authentication flow
      - Direct Swagger UI testing is not available for OAuth endpoints
    `,
  })
  @ApiParam({
    name: 'email',
    required: true,
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Learning recommendations retrieved successfully',
    type: RecommendationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No skill gap data found for the user',
  })
  async getRecommendations(
    @Param('email', new ValidationPipe()) email: string,
  ): Promise<RecommendationResponseDto> {
    return this.recommendationService.getRecommendations(email);
  }
}
