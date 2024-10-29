import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { format } from 'date-fns';
import { Workbook } from 'exceljs';
import * as fs from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';
import { IAppConfig } from 'src/__shared__/interfaces';
import { Attendance } from 'src/__shared__/models/attendance.entity';
import { Employee } from 'src/__shared__/models/employee.entity';
import { User } from 'src/__shared__/models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly config: ConfigService<IAppConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectQueue('mailQueue') private readonly mailQueue: Queue,
  ) {}

  async entrance(user: User) {
    const attendance = this.attendanceRepository.create({
      user: user,
    });
    const userT = await this.userRepository.findOne({ where: { id: user.id } });
    const employee = await this.employeeRepository.findOne({
      where: { user: userT.employee },
    });
    await this.mailQueue.add('sendEmail', {
      email: `${user.email}`,
      subject: 'Attendance recorded',
      from: `"No Reply" <${this.config.get('mail').from}>`,
      context: {
        username: `${employee.firstName} ${employee.lastName}`,
      },
      template: './default.template.hbs',
    });

    await this.attendanceRepository.save(attendance);
    return { message: 'Attendance recorded and email queued' };
  }

  async leaveTime(id: number, user: User) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });
    if (!attendance) {
      throw new NotFoundException('No attendance record found ');
    }
    const userT = await this.userRepository.findOne({ where: { id: user.id } });
    const employee = await this.employeeRepository.findOne({
      where: { user: userT.employee },
    });
    attendance.leaveTime = new Date();
    await this.attendanceRepository.save(attendance);
    await this.mailQueue.add('sendEmail', {
      email: `${user.email}`,
      subject: 'Attendance recorded',
      from: `"No Reply" <${this.config.get('mail').from}>`,
      context: {
        username: `${employee.firstName} ${employee.lastName}`,
      },
      template: './default.template.hbs',
    });
    return { message: 'Attendance recorded and email queued' };
  }

  async generateAttendanceReport() {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Full Name', key: 'fullName', width: 30 },
      { header: 'Arrival Time', key: 'arrivalTime', width: 30 },
      { header: 'Leave Time', key: 'leaveTime', width: 30 },
    ];

    const attendances = await this.attendanceRepository.find({
      relations: ['user', 'user.employee'],
    });

    attendances.forEach((attendance) => {
      const User = attendance.user;
      worksheet.addRow({
        id: attendance.id,
        fullName: `${User.employee.firstName} ${User.employee.lastName}`,
        arrivalTime: format(
          new Date(attendance.arrivalTime),
          'yyyy-MM-dd:HH:mm',
        ),
        leaveTime: attendance.leaveTime
          ? format(new Date(attendance.leaveTime), 'yyyy-MM-dd:HH:mm')
          : '',
      });
    });

    const filename = `report-excel-${Date.now()}`;

    return {
      workbook,
      filename,
    };
  }

  async generateAttendanceReportPDF() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    const title = 'Attendance Report';
    page.drawText(title, {
      x: 50,
      y: 370,
      size: 24,
      color: rgb(0, 0, 0),
    });

    const headers = [
      'ID',
      'User ID',
      'Full Name',
      'Arrival Time',
      'Leave Time',
    ];
    const startY = 340;
    const rowHeight = 20;

    const columnWidths = [50, 70, 120, 150, 150];

    headers.forEach((header, index) => {
      page.drawText(header, {
        x: 50 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
        y: startY,
        size: 14,
        color: rgb(0, 0, 0),
      });
    });

    const attendances = await this.attendanceRepository.find({
      relations: ['user', 'user.employee'],
    });

    let currentY = startY - rowHeight;

    attendances.forEach((attendance) => {
      const employee = attendance.user.employee;

      const rowData = [
        attendance.id.toString(),
        attendance.user.id.toString(),
        `${employee.firstName} ${employee.lastName}`,
        format(new Date(attendance.arrivalTime), 'yyyy-MM-dd:HH:mm'),
        attendance.leaveTime
          ? format(new Date(attendance.leaveTime), 'yyyy-MM-dd:HH:mm')
          : 'N/A',
      ];

      rowData.forEach((data, index) => {
        page.drawText(data, {
          x: 50 + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
          y: currentY,
          size: 12,
          color: rgb(0, 0, 0),
        });
      });

      currentY -= rowHeight;
    });

    const pdfBytes = await pdfDoc.save();
    const filename = `attendance_report_${Date.now()}.pdf`;

    fs.writeFileSync(filename, pdfBytes);

    return {
      filename,
    };
  }
}
