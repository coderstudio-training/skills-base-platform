import { Body, Controller, Get, NotFoundException } from '@nestjs/common';
import { PerformanceService } from '../services/computation.service';

@Controller('api/skills-assessments')
export class PerformanceController {
  constructor(private readonly assessmentsService: PerformanceService) {}

  /**
   * Endpoint to calculate performance for a specific employee.
   * @param body - The body contains the email of the employee and business unit (BU).
   * @returns A performance report including skill averages for the employee.
   */
  @Get('performance')
  async getPerformance(@Body() body: { email: string; bu: string }) {
    try {
      const { email, bu } = body;

      if (!email || !bu) {
        throw new Error('Both email and business unit (BU) are required.');
      }

      // Call the service to calculate performance
      const performance = await this.assessmentsService.calculatePerformance(
        email,
        bu,
      );

      return performance; // Return the calculated performance data
    } catch (error) {
      // Handle error if the employee's assessments are not found or invalid input
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException if the employee is not found
      } else {
        // Any other errors, return a generic error message
        throw new Error('An error occurred while calculating performance.');
      }
    }
  }

  /**
   * Endpoint to calculate performance for all employees in a specific business unit (BU).
   * @param body - The body contains the business unit (BU).
   * @returns A list of performance reports including skill averages for all employees in the BU.
   */
  @Get('bulk-performance')
  async bulkCalculatePerformance(@Body() body: { bu: string }) {
    try {
      const { bu } = body;

      if (!bu) {
        throw new Error('Business unit (BU) is required.');
      }

      // Call the service to calculate performance for all employees in the BU
      const performance =
        await this.assessmentsService.bulkCalculatePerformance(bu);

      return performance; // Return the bulk performance data for all employees
    } catch (error) {
      // Handle errors related to bulk performance calculation
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException if no employees found in the BU
      } else {
        // Any other errors, return a generic error message
        throw new Error(
          'An error occurred while calculating bulk performance.',
        );
      }
    }
  }
}
