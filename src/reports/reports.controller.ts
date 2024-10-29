import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { ERoles } from 'src/__shared__/enums/enum';
import { AttendanceService } from 'src/attendance/attendance.service';
import { AllowRoles } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('reports')
@ApiTags('reports')
@UseGuards(JwtGuard, RolesGuard)
@AllowRoles(ERoles.ADMIN)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class ReportsController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('download/excel')
  async downloadExcel(@Res() res: Response) {
    const { workbook, filename } =
      await this.attendanceService.generateAttendanceReport();
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=${filename}.xlsx`,
    });
    workbook.xlsx.write(res).then(() => res.end());
  }
  @Get('download/pdf')
  async downloadPdf(@Res() res: Response) {
    const { filename } =
      await this.attendanceService.generateAttendanceReportPDF();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${filename}`,
    });

    const filePath = `./${filename}`;
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
