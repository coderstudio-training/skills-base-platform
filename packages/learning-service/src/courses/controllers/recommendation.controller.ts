import {
  Controller,
  Get,
  Headers,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  LoggingInterceptor,
  Permission,
  RedisCache,
  RequirePermissions,
  Roles,
  RolesGuard,
  TransformInterceptor,
  UserRole,
} from '@skills-base/shared';
import { RecommendationResponseDto } from '../dto/recommendation.dto';
import { RecommendationService } from '../services/recommendation.service';

@ApiTags('Learning')
@Controller('api/learning')
@ApiBearerAuth('JWT-Staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('recommendations/:email')
  @Roles(UserRole.STAFF, UserRole.MANAGER)
  @RequirePermissions(Permission.VIEW_LEARNING)
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
  @RedisCache({
    keyGenerator: (ctx) =>
      `learning:recommendations:${ctx.request.params.email}`,
  })
  async getRecommendations(
    @Param('email') email: string,
    @Headers('authorization') authHeader: string,
  ): Promise<RecommendationResponseDto> {
    return this.recommendationService.getRecommendations(email, authHeader);
  }
}
