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

  async calculatePerformance(email: string, prefixBU: string) {
    this.logger.log(
      `Calculating performance for email: ${email} and BU prefix: ${prefixBU}`,
    );

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      this.logger.error(`Invalid email format: ${email}`);
      throw new Error('Invalid email format.');
    }

    try {
      // Dynamically get the models for self-assessment and manager-assessment
      const SelfAssessmentModel = this.getModelForAssessmentType('self');

      this.logger.log(
        'Successfully retrieved the SelfAssessments and ManagerAssessments models.',
      );

      // Use aggregation with $lookup to join self-assessment and manager-assessment collections
      this.logger.log(
        'Starting aggregation query to retrieve performance data.',
      );
      const result = await SelfAssessmentModel.aggregate([
        {
          $match: { emailAddress: email, prefixBU },
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
            emailAddress: '$emailAddress',
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
      if (!result || result.length === 0) {
        this.logger.error(`No assessments found for email: ${email}`);
        throw new NotFoundException('Employee assessments not found.');
      }

      this.logger.log(
        'Performance data calculated successfully:',
        JSON.stringify(result),
      );

      // Return the performance data along with self and manager skills
      return {
        emailAddress: email,
        nameOfResource: result[0].name,
        capability: result[0].capability,
        careerLevel: result[0].careerLevel,
        // selfSkills: result[0].selfSkills, // Include selfSkills in the response
        // managerSkills: result[0].managerSkills, // Include managerSkills in the response
        averageOfSkills: result[0].averageOfSkills,
        lastUpdated: new Date(),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Error during performance calculation:', error.stack);
        throw new Error('An error occurred while calculating performance.');
      } else {
        this.logger.error(
          'Unknown error occurred during performance calculation.',
        );
        throw new Error('An unknown error occurred.');
      }
    }
  }

  // New method to bulk calculate performance for all employees from MongoDB
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
        // selfSkills: result[0].selfSkills, // Include selfSkills in the response
        // managerSkills: result[0].managerSkills, // Include managerSkills in the response
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
