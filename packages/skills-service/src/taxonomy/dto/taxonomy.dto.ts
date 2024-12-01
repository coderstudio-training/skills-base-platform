import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '@skills-base/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class Taxonomy extends BaseDto {
  @ApiProperty({
    description: 'Unique identifier pertaining to google document',
    example: '1FpwF_0S9w7RuZlpkFPK4f0rNIRSfAzGu5eqj38ME5NA',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Document ID must not be empty!' })
  docId!: string;

  @ApiProperty({
    description: 'Revision identifier for the google document',
    example:
      'ALBJ4Lsl5noFE7w3ASf-g0UwA-MIWkq6YlGtY5JgP3_9MnxNzwyOAaOvZXbTDddwZRcxE57wl_-sKQK7jvQBZjt-qg',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  docRevisionId!: string;

  @ApiProperty({
    description: 'Title of the google document',
    example: 'TSC_Test Planning',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  docTitle!: string;

  @ApiProperty({
    description: 'Title of the taxonomy',
    example: 'Test Planning',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Category of the taxonomy',
    example: 'Development and Implementation',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({
    description: 'Detailed description of the taxonomy',
    example:
      'Develop a test strategy and systematic test procedures to verify...',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class T_TaxonomyDTO extends Taxonomy {
  @ApiProperty({
    description: 'Proficiency description as a key-value pair',
    example: {
      Level1: ['', ''],
      Level2: ['ICT-DIT-2017-1.1', 'Indentify and document the basic...'],
      Level3: ['ICT-DIT-3017-1.1', 'Determine requirements and develop...'],
      Level4: ['ICT-DIT-4017-1.2', 'Define testing objectives...'],
      Level5: ['ICT-DIT-5017-1.1', 'Develop a test strategy...'],
      Level6: ['', ''],
    },
    type: Object,
    required: true,
  })
  @IsObject()
  @IsNotEmpty()
  proficiencyDescription!: Record<string, string[]>;

  @ApiProperty({
    description: 'Abilities description as a key-value pair',
    example: {
      Level1: [''],
      Level2: [
        'Identify basic tools...',
        'Document testware...',
        'Maintain link between requirements...',
        'Gather resources...',
      ],
      Level3: [
        'Determine the requirements...',
        'Propose relevant tests...',
        'Identify points...',
      ],
      Level4: [
        'Define testing objectives...',
        'Design test plans and procedures...',
      ],
      Level5: ['Articulate implications...'],
      Level6: [''],
    },
    type: Object,
    required: true,
  })
  @IsObject()
  @IsNotEmpty()
  abilities!: Record<string, string[]>;

  @ApiProperty({
    description: 'Knowledge description as a key-value pair',
    type: Object,
    example: {
      Level1: [''],
      Level2: [
        'Basic testing tools...',
        'Documentation requirements...',
        'Concept and usage...',
      ],
      Level3: [
        'Different types or levels...',
        'Range of tests...',
        'Optimal scheduling times...',
        'Critical components',
      ],
      Level4: ['Testing objectives...', 'Test plans and procedures...'],
      Level5: ['Organization and industry standards and baselines'],
      Level6: [''],
    },
    required: true,
  })
  @IsObject()
  @IsNotEmpty()
  knowledge!: Record<string, string[]>;

  @ApiProperty({
    description: 'Associated business unit',
    example: 'QA_Testing',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  businessUnit!: string;

  @ApiProperty({
    description: 'Optional range of application as an array of strings',
    example: [
      'Test planning may be applied but are not limited to:',
      'Stress Tests',
      'Load Tests',
      'Volume Test',
      'Baseline Tests',
    ],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  rangeOfApplication?: string[];
}

export class S_TaxonomyDTO extends Taxonomy {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'mapped to levels, example: career level 1 = novice',
    example: [
      'Novice',
      'Beginner',
      'Intermediate',
      'Advanced',
      'Expert',
      'Guru',
    ],
  })
  rating!: string[];

  @IsObject()
  @IsNotEmptyObject()
  @ApiProperty({
    description: 'mapped to levels, example: career level 1 = novice',
    example: {
      'level 1': [
        'Sometimes exercises self-awareness...',
        'Sometimes identifies opportunities...',
      ],
      'level 2': [
        'Always exercises self-awareness...',
        'Always identifies opportunities...',
      ],
      'level 3': [
        'Sometimes analyses own well-being...',
        'Sometimes deploys various learning...',
      ],
      'level 4': [
        'Always analyses own well-being...',
        'Always deploys various learning...',
      ],
      'level 5': [
        'Sometimes evaluates strategies...',
        'Sometimes establishes...',
      ],
      'level 6': ['Always evaluates strategies...', 'Always establishes...'],
    },
  })
  proficiencyDescription!: Record<string, string[]>;

  @IsObject()
  @IsNotEmptyObject()
  @ApiProperty({
    description: 'career level benchmarks',
    example: {
      'level 1': [],
      'level 2': ['Professional II'],
      'level 3': ['Professional III'],
      'level 4': ['Professional IV', 'Manager I'],
      'level 5': ['Manager II', 'Manager III', 'Manager IV'],
      'level 6': ['Director I', 'Director II', 'Director III', 'Director IV'],
    },
  })
  benchmark!: Record<string, string[]>;
}

export class BulkUpsertTaxonomyDTO {
  @ValidateNested({ each: true })
  @Type(() => Taxonomy)
  data!: Taxonomy[];
}

export class BulkUpsertTTaxonomyDTO {
  @ApiProperty({
    description: 'Array of technical taxonomy data to be upserted',
    type: [T_TaxonomyDTO],
  })
  @ValidateNested({ each: true })
  @Type(() => T_TaxonomyDTO)
  data!: T_TaxonomyDTO[];
}

export class BulkUpsertSTaxonomyDTO {
  @ApiProperty({
    description: 'Array of soft skills taxonomy data to be upserted',
    type: [S_TaxonomyDTO],
  })
  @ValidateNested({ each: true })
  @Type(() => S_TaxonomyDTO)
  data!: S_TaxonomyDTO[];
}
