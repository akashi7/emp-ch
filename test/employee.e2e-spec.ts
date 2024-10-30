import {
  ForbiddenException,
  INestApplication,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GenericResponse } from 'src/__shared__/dto';
import { ERoles } from 'src/__shared__/enums/enum';
import { Employee } from 'src/__shared__/models/employee.entity';
import { User } from 'src/__shared__/models/user.entity';
import { AttendanceService } from 'src/attendance/attendance.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UpdateUserEmployeeDto, resetPasswordDto } from 'src/employee/dto';
import { EmployeeController } from 'src/employee/employee.controller';
import { EmployeeService } from 'src/employee/employee.service';
import * as request from 'supertest';

describe('EmployeeController E2E', () => {
  let app: INestApplication;
  let employeeService: EmployeeService;
  let attendanceService: AttendanceService;
  let user: any;

  beforeAll(async () => {
    user = {
      email: 'a@y',
      password: 'mocked-password',
      role: ERoles.EMPLOYEE,
      isActive: true,
      employee: new Employee(),
      attendance: [],
      id: 1,
      created_at: new Date(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: AttendanceService,
          useValue: {
            entrance: jest.fn(),
            leaveTime: jest.fn(),
          },
        },
        {
          provide: EmployeeService,
          useValue: {
            update: jest.fn(),
            resetPassword: jest.fn(),
            getAllEmployees: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
    employeeService = module.get<EmployeeService>(EmployeeService);
    attendanceService = module.get<AttendanceService>(AttendanceService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /employee', () => {
    it('should retrieve all employees successfully', async () => {
      const mockEmployees: Employee[] = [
        {
          firstName: 'John',
          lastName: 'Doe',
          user: new User(),
          phoneNumber: '',
          identifier: '',
          id: 0,
          created_at: undefined,
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          user: new User(),
          phoneNumber: '',
          identifier: '',
          id: 0,
          created_at: undefined,
        },
      ];
      jest
        .spyOn(employeeService, 'getAllEmployees')
        .mockResolvedValue(mockEmployees);

      const response = await request(app.getHttpServer())
        .get('/employees')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body).toEqual({
        data: mockEmployees,
        message: 'employees retrieved',
      });
    });

    it('should throw a forbidden error if the user is not an admin', async () => {
      jest
        .spyOn(employeeService, 'getAllEmployees')
        .mockRejectedValue(
          new ForbiddenException('Access denied must be admin'),
        );

      await request(app.getHttpServer())
        .get('/employees')
        .set('Authorization', 'Bearer valid_token')
        .expect(403);
    });

    it('should throw an internal server error if retrieval fails', async () => {
      jest
        .spyOn(employeeService, 'getAllEmployees')
        .mockRejectedValue(new InternalServerErrorException());

      await request(app.getHttpServer())
        .get('/employees')
        .set('Authorization', 'Bearer valid_token')
        .expect(500);
    });
  });

  describe('POST /employee/arrive', () => {
    it('should record attendance successfully', async () => {
      jest
        .spyOn(attendanceService, 'entrance')
        .mockResolvedValue({ message: 'Attendance recorded and email queued' });

      const response = await request(app.getHttpServer())
        .post('/employees/arrive')
        .set('Authorization', 'Bearer valid_token')
        .send({ user })
        .expect(201);

      expect(response.body).toEqual({
        data: { message: 'Attendance recorded and email queued' },
        message: 'attendance recorded',
      });
    });

    it('should throw an internal server error', async () => {
      jest
        .spyOn(attendanceService, 'entrance')
        .mockRejectedValue(new InternalServerErrorException());

      await request(app.getHttpServer())
        .post('/employees/arrive')
        .set('Authorization', 'Bearer valid_token')
        .expect(500);
    });
  });

  describe('PATCH /employee/depart', () => {
    it('should update attendance on departure', async () => {
      const attendanceId = 1;
      jest
        .spyOn(attendanceService, 'leaveTime')
        .mockResolvedValue({ message: 'Attendance recorded and email queued' });

      const response = await request(app.getHttpServer())
        .patch('/employees/depart')
        .set('Authorization', 'Bearer valid_token')
        .query({ id: attendanceId })
        .expect(200);

      expect(response.body).toEqual({
        data: { message: 'Attendance recorded and email queued' },
        message: 'attendance updated',
      });
    });

    it('should throw an error for invalid attendance ID', async () => {
      const attendanceId = 999;
      jest
        .spyOn(attendanceService, 'leaveTime')
        .mockRejectedValue(
          new NotFoundException('Attendance record not found'),
        );

      await request(app.getHttpServer())
        .patch('/employees/depart')
        .set('Authorization', 'Bearer valid_token')
        .query({ id: attendanceId })
        .expect(404);
    });
  });

  describe('PATCH /employee/update', () => {
    it('should update employee information successfully', async () => {
      const dto: UpdateUserEmployeeDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '123',
        identifier: 'ERR',
      };

      jest
        .spyOn(employeeService, 'update')
        .mockResolvedValue(Promise.resolve());

      const response = await request(app.getHttpServer())
        .patch('/employees/update')
        .set('Authorization', 'Bearer valid_token')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual({ message: 'employee updated' });
    });

    it('should throw an internal server error during update', async () => {
      const dto: UpdateUserEmployeeDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '123',
        identifier: 'ERR',
      };

      jest
        .spyOn(employeeService, 'update')
        .mockRejectedValue(new InternalServerErrorException());

      await request(app.getHttpServer())
        .patch('/employees/update')
        .set('Authorization', 'Bearer valid_token')
        .send(dto)
        .expect(500);
    });
  });

  describe('PATCH /employee/reset-password', () => {
    it('should reset the employee password successfully', async () => {
      const dto: resetPasswordDto = {
        password: 'newPassword123',
      };

      jest.spyOn(employeeService, 'resetPassword').mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .patch('/employees/reset-password')
        .set('Authorization', 'Bearer valid_token')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual(
        new GenericResponse('Password reseted', null),
      );
    });

    it('should throw an internal server error during password reset', async () => {
      const dto: resetPasswordDto = {
        password: 'newPassword123',
      };

      jest
        .spyOn(employeeService, 'resetPassword')
        .mockRejectedValue(new InternalServerErrorException());

      await request(app.getHttpServer())
        .patch('/employees/reset-password')
        .set('Authorization', 'Bearer valid_token')
        .send(dto)
        .expect(500);
    });
  });
});
