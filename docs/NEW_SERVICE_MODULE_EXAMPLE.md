# New Service Module Example: Skills Module

This example demonstrates creating a Skills module following the service module guide patterns.

## Example Implementation

### 1. Entity Definition

```typescript
// src/skills/entities/skill.entity.ts
import { BaseEntity } from '@skills-base/shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Skill extends BaseEntity {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  level: number;

  @Prop({ type: String, ref: 'User' })
  createdBy: string;

  @Prop({ type: [{ type: String, ref: 'User' }] })
  endorsedBy: string[];
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
```

### 2. DTOs

```typescript
// src/skills/dto/create-skill.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ example: 'React.js' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Frontend Development' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'A JavaScript library for building user interfaces' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 3, minimum: 0, maximum: 5 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  level?: number;
}

// src/skills/dto/update-skill.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {}
```

### 3. Service Implementation

```typescript
// src/skills/skills.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '@skills-base/shared';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto, UpdateSkillDto } from './dto';

@Injectable()
export class SkillsService extends BaseService<Skill> {
  constructor(
    @InjectModel(Skill.name)
    private skillModel: Model<Skill>,
  ) {
    super(skillModel);
  }

  async create(createDto: CreateSkillDto, userId: string): Promise<Skill> {
    // Check for existing skill with same name
    const existing = await this.skillModel.findOne({ name: createDto.name });
    if (existing) {
      throw new ConflictException('Skill with this name already exists');
    }

    const createdSkill = new this.skillModel({
      ...createDto,
      createdBy: userId,
      endorsedBy: [], // Initialize empty endorsements
    });
    return createdSkill.save();
  }

  async endorseSkill(skillId: string, userId: string): Promise<Skill> {
    const skill = await this.skillModel.findById(skillId);
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (!skill.endorsedBy.includes(userId)) {
      skill.endorsedBy.push(userId);
      await skill.save();
    }

    return skill;
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return this.skillModel.find({ category }).exec();
  }

  async searchSkills(query: string): Promise<Skill[]> {
    return this.skillModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
        ],
      })
      .exec();
  }
}
```

### 4. Controller Implementation

```typescript
// src/skills/skills.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@skills-base/shared/guards';
import { Roles } from '@skills-base/shared/decorators';
import { UserRole } from '@skills-base/shared/constants';
import { SkillsService } from './skills.service';
import { CreateSkillDto, UpdateSkillDto } from './dto';

@ApiTags('skills')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new skill' })
  @ApiResponse({ status: 201, description: 'Skill created successfully' })
  async create(@Body() createDto: CreateSkillDto, @Request() req) {
    return this.skillsService.create(createDto, req.user.userId);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all skills or search skills' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(@Query('search') search?: string, @Query('category') category?: string) {
    if (search) {
      return this.skillsService.searchSkills(search);
    }
    if (category) {
      return this.skillsService.getSkillsByCategory(category);
    }
    return this.skillsService.findAll();
  }

  @Post(':id/endorse')
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Endorse a skill' })
  async endorseSkill(@Param('id') id: string, @Request() req) {
    return this.skillsService.endorseSkill(id, req.user.userId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(@Param('id') id: string, @Body() updateDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }
}
```

### 5. Module Configuration

```typescript
// src/skills/skills.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { Skill, SkillSchema } from './entities/skill.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Skill.name, schema: SkillSchema }])],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
```

## Testing Example

```typescript
// src/skills/skills.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto';

describe('SkillsService', () => {
  let service: SkillsService;
  let model: Model<Skill>;

  const mockSkill = {
    name: 'React.js',
    category: 'Frontend',
    description: 'UI Library',
    level: 3,
    createdBy: 'user123',
    endorsedBy: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getModelToken(Skill.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockSkill),
            constructor: jest.fn().mockResolvedValue(mockSkill),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    model = module.get<Model<Skill>>(getModelToken(Skill.name));
  });

  it('should create a skill', async () => {
    const createDto: CreateSkillDto = {
      name: 'React.js',
      category: 'Frontend',
      description: 'UI Library',
      level: 3,
    };

    jest.spyOn(model, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(null),
    } as any);

    jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockSkill));

    const result = await service.create(createDto, 'user123');
    expect(result).toEqual(mockSkill);
  });
});
```

This example demonstrates:

1. Complete CRUD operations
2. Role-based access control
3. Custom business logic (endorsements)
4. Search functionality
5. Swagger documentation
6. Unit testing
7. Error handling
8. Input validation

The Skills module serves as a practical example of implementing the service module patterns while adding real-world features like endorsements and category-based filtering.
