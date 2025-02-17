import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './controllers/courses.controller';
import { CoursesService } from './services/courses.service';

describe('AppController', () => {
  let controller: CoursesController;
  // let service: CoursesService;

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
