import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Workbook } from 'exceljs';
import * as mockFs from 'mock-fs';
import { ERoles } from 'src/__shared__/enums/enum';
import { Employee } from 'src/__shared__/models/employee.entity';
import { AttendanceService } from 'src/attendance/attendance.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { ReportsController } from 'src/reports/reports.controller';
import * as request from 'supertest';

describe('ReportsController (e2e)', () => {
  let app: INestApplication;
  let attendanceService: AttendanceService;

  let user: any;

  beforeAll(async () => {
    user = {
      email: 'a@y',
      password: 'mocked-password',
      role: ERoles.ADMIN,
      isActive: true,
      employee: new Employee(),
      attendance: [],
      id: 1,
      created_at: new Date(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: AttendanceService,
          useValue: {
            generateAttendanceReport: jest.fn(),
            generateAttendanceReportPDF: jest.fn(),
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
    attendanceService = module.get<AttendanceService>(AttendanceService);
  });

  afterAll(async () => {
    await app.close();
    mockFs.restore();
  });

  describe('GET /reports/download-excel', () => {
    it('should download excel file', async () => {
      const mockWorkbook = new Workbook();
      const sheet = mockWorkbook.addWorksheet('Attendance');
      sheet.addRow(['Header1', 'Header2']);
      sheet.addRow(['Data1', 'Data2']);

      jest
        .spyOn(attendanceService, 'generateAttendanceReport')
        .mockResolvedValue({
          filename: 'attendance_report',
          workbook: mockWorkbook,
        });

      const response = await request(app.getHttpServer())
        .get('/reports/download/excel')
        .expect(200)
        .set('Authorization', 'Bearer valid_token')
        .send({ user })
        .expect(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        .expect(
          'Content-Disposition',
          'attachment; filename=attendance_report.xlsx',
        );

      expect(response.body).toBeInstanceOf(Object);
    });
  });

  describe('GET /reports/download-pdf', () => {
    jest.setTimeout(5000);

    beforeEach(() => {
      mockFs({
        './MockFile.pdf': 'dummy pdf content',
      });
    });

    it('should download pdf file', async () => {
      jest
        .spyOn(attendanceService, 'generateAttendanceReportPDF')
        .mockResolvedValue(Promise.resolve({ filename: 'MockFile.pdf' }));

      const response = await request(app.getHttpServer())
        .get('/reports/download/pdf')
        .set('Authorization', 'Bearer valid_token')
        .send({ user })
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename=MockFile.pdf',
      );
      expect(response.body).toBeDefined();
    });
  });
});
