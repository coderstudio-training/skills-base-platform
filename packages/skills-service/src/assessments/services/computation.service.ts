import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  ManagerAssessmentSchema,
  SelfAssessmentSchema,
} from '../entities/assessments.entity';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  private getSchemaForAssessmentType(assessmentType: string) {
    if (assessmentType === 'manager') {
      return ManagerAssessmentSchema;
    } else if (assessmentType === 'self') {
      return SelfAssessmentSchema;
    }
    throw new BadRequestException(`Invalid assessment type: ${assessmentType}`);
  }

  private getModelForAssessmentType(
    // prefixBU: string,
    assessmentType: string,
  ): Model<any> {
    const collectionName = `Capability_${assessmentType}Assessments`;
    if (!this.connection.models[collectionName]) {
      const schema = this.getSchemaForAssessmentType(assessmentType);
      const model = this.connection.model(
        collectionName,
        schema,
        collectionName,
      );
      this.ensureModelIndexes(model);
    }
    return this.connection.models[collectionName];
  }

  private ensureModelIndexes(model: Model<any>) {
    model.createIndexes();
  }

  // Method to bulk calculate performance for all employees from MongoDB
  async bulkCalculatePerformance(prefixBU: string) {
    this.logger.log(
      `Bulk calculating performance for all employees in ${prefixBU}`,
    );

    try {
      // Dynamically get the models for self-assessment and manager-assessment
      const SelfAssessmentModel = this.getModelForAssessmentType('self');

      this.logger.log(
        'Successfully retrieved the SelfAssessments and ManagerAssessments models.',
      );

      // Step 1: Aggregate data for all employees
      const performanceResults = await SelfAssessmentModel.aggregate([
        {
          $match: { capability: prefixBU },
        },
        {
          $lookup: {
            from: `Capability_managerAssessments`,
            localField: 'emailAddress',
            foreignField: 'emailOfResource',
            as: 'managerAssessment',
          },
        },
        {
          $unwind: {
            path: '$managerAssessment',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            email: '$emailAddress',
            name: '$nameOfResource',
            capability: '$capability',
            careerLevel: '$careerLevelOfResource',
            selfSkills: '$skills',
            managerSkills: '$managerAssessment.skills',
          },
        },
        {
          $addFields: {
            averageOfSkills: {
              $let: {
                vars: {
                  selfSkillsArray: { $objectToArray: '$selfSkills' },
                  managerSkillsArray: { $objectToArray: '$managerSkills' },
                },
                in: {
                  $map: {
                    input: '$$selfSkillsArray',
                    as: 'selfSkill',
                    in: {
                      k: '$$selfSkill.k',
                      v: {
                        $avg: [
                          '$$selfSkill.v',
                          {
                            $arrayElemAt: [
                              {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: '$$managerSkillsArray',
                                      cond: {
                                        $eq: ['$$this.k', '$$selfSkill.k'],
                                      },
                                    },
                                  },
                                  as: 'matchingSkill',
                                  in: '$$matchingSkill.v',
                                },
                              },
                              0,
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $addFields: {
            averageOfSkills: { $arrayToObject: '$averageOfSkills' },
          },
        },
      ]);

      // If no results found, throw a NotFoundException
      if (!performanceResults || performanceResults.length === 0) {
        this.logger.error(`No assessments found for BU prefix: ${prefixBU}`);
        throw new NotFoundException('Employee assessments not found.');
      }

      this.logger.log('Bulk performance calculation completed successfully.');

      return performanceResults.map((result) => ({
        emailAddress: result.email,
        nameOfResource: result.name,
        capability: result.capability,
        careerLevel: result.careerLevel,
        averageOfSkills: result.averageOfSkills,
        lastUpdated: new Date(),
      }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          'Error during bulk performance calculation:',
          error.stack,
        );
        throw new Error(
          'An error occurred during bulk performance calculation.',
        );
      } else {
        this.logger.error(
          'Unknown error occurred during bulk performance calculation.',
        );
        throw new Error('An unknown error occurred.');
      }
    }
  }
}
