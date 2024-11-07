import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

describe('AppController', () => {
  let controller: CoursesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [CoursesService],
    }).compile();

    controller = app.get<CoursesController>(CoursesController);
  });

  describe('controller', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have bulkUpdate method', () => {
      expect(controller.bulkUpdate).toBeDefined();
    });
  });
});
