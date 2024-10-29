import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ERoles } from 'src/__shared__/enums/enum';
import { Employee } from 'src/__shared__/models/employee.entity';
import { User } from 'src/__shared__/models/user.entity';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import {
  forgotPasswordDto,
  UserEmployeeDto,
  VerifyUserDto,
} from 'src/auth/dto';
import * as request from 'supertest';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            createUser: jest.fn(),
            loginUser: jest.fn(),
            EmailForgotPassword: jest.fn(),
            verifyUserOnReset: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    authService = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/sign-up', () => {
    it('should create a user successfully', async () => {
      const dto: UserEmployeeDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        identifier: '123456',
        phoneNumber: '1234567890',
        role: ERoles.EMPLOYEE,
      };

      const userInstance = new User();
      userInstance.email = dto.email;
      userInstance.password = dto.password;
      userInstance.role = dto.role;

      jest.spyOn(authService, 'createUser').mockResolvedValue({
        data: { user: userInstance, token: 'mocked-token' },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual({
        data: { user: userInstance, token: 'mocked-token' },
      });
    });

    it('should throw a conflict exception if user already exists', async () => {
      const dto: UserEmployeeDto = {
        email: 'existing@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        identifier: '123456',
        phoneNumber: '1234567890',
        role: ERoles.EMPLOYEE,
      };

      jest
        .spyOn(authService, 'createUser')
        .mockRejectedValue(
          new ConflictException('User by email already exist'),
        );

      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(dto)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should log in a user successfully', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const userInstance = new User();
      userInstance.email = dto.email;
      userInstance.password = dto.password;

      jest.spyOn(authService, 'loginUser').mockResolvedValue({
        data: { user: userInstance, token: 'mocked-token' },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual({
        data: { user: userInstance, token: 'mocked-token' },
      });
    });

    it('should throw a not found exception if user does not exist', async () => {
      const dto = { email: 'nonexistent@example.com', password: 'password' };

      jest
        .spyOn(authService, 'loginUser')
        .mockRejectedValue(new NotFoundException('User not found'));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(404);
    });

    it('should throw a forbidden exception if password is wrong', async () => {
      const dto = { email: 'test@example.com', password: 'wrongpassword' };

      jest
        .spyOn(authService, 'loginUser')
        .mockRejectedValue(new ForbiddenException('Wrong User password'));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(403);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send an email for password reset', async () => {
      const dto: forgotPasswordDto = { email: 'test@example.com' };

      jest.spyOn(authService, 'EmailForgotPassword').mockResolvedValue({
        data: {
          message: Promise.resolve({ message: 'Email sent' }),
          user: {
            email: dto.email,
            password: 'mocked-password',
            role: ERoles.EMPLOYEE,
            isActive: true,
            employee: new Employee(),
            attendance: [],
            id: 0,
            created_at: undefined,
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual({
        data: {
          message: {},
          user: {
            email: dto.email,
            password: 'mocked-password',
            role: ERoles.EMPLOYEE,
            isActive: true,
            attendance: [],
            employee: {},
            id: 0,
            created_at: undefined,
          },
        },
      });
    });

    it('should throw a not found exception if user does not exist', async () => {
      const dto: forgotPasswordDto = { email: 'nonexistent@example.com' };

      jest
        .spyOn(authService, 'EmailForgotPassword')
        .mockRejectedValue(new NotFoundException('User not found'));

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(dto)
        .expect(404);
    });
  });

  describe('GET /auth/resetPassword', () => {
    it('should verify user and return token', async () => {
      const dto: VerifyUserDto = { token: 'valid-token' };
      const userInstance = new User();
      userInstance.email = 'test';
      userInstance.password = 'akashi';

      jest.spyOn(authService, 'verifyUserOnReset').mockResolvedValue({
        data: { user: userInstance, token: 'mocked-token' },
      });

      const response = await request(app.getHttpServer())
        .get('/auth/resetPassword')
        .query(dto)
        .expect(200);

      // Change the expected response to match the structure from the service
      expect(response.body).toEqual({
        data: { user: userInstance, token: 'mocked-token' },
      });
    });

    it('should throw a bad request exception for invalid token', async () => {
      const dto: VerifyUserDto = { token: 'invalid-token' };

      jest
        .spyOn(authService, 'verifyUserOnReset')
        .mockRejectedValue(new BadRequestException('Invalid or expired token'));

      await request(app.getHttpServer())
        .get('/auth/resetPassword')
        .query(dto)
        .expect(400);
    });
  });
});
