import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { User } from './users/entities/user.entity';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedResult: Partial<User> = {
        id: 'someId',
        ...createUserDto,
      };

      jest
        .spyOn(usersService, 'create')
        .mockResolvedValue(expectedResult as User);

      const result = await usersController.create(createUserDto);
      expect(result).toEqual(expectedResult);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedResult: Partial<User>[] = [
        {
          id: '1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
        },
        {
          id: '2',
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
        },
      ];

      jest
        .spyOn(usersService, 'findAll')
        .mockResolvedValue(expectedResult as User[]);

      const result = await usersController.findAll();
      expect(result).toEqual(expectedResult);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });
});
