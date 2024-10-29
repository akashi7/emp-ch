import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericResponse } from 'src/__shared__/dto';
import { ERoles } from 'src/__shared__/enums/enum';
import { User } from 'src/__shared__/models/user.entity';
import { AttendanceService } from 'src/attendance/attendance.service';
import { AllowRoles, GetUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { resetPasswordDto, UpdateUserEmployeeDto } from './dto';
import { EmployeeService } from './employee.service';

@Controller('employee')
@ApiTags('employee')
@UseGuards(JwtGuard, RolesGuard)
@AllowRoles(ERoles.EMPLOYEE)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class EmployeeController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly employeeService: EmployeeService,
  ) {}
  @ApiCreatedResponse({ description: 'Attendance Recorded successfully' })
  @ApiOperation({ summary: 'Make attendance' })
  @Post('arrive')
  async recordArrival(@GetUser() user: User) {
    const result = await this.attendanceService.entrance(user);
    return new GenericResponse('attendance recorded', result);
  }

  @ApiOkResponse({ description: 'Attendance Recorded successfully' })
  @ApiOperation({ summary: 'Depart' })
  @HttpCode(200)
  @Patch('depart')
  @ApiQuery({
    name: 'id',
    type: Number,
    description: 'ID of the attendance record',
  })
  async recordDeparture(@Query('id') id: number, @GetUser() user: User) {
    const result = await this.attendanceService.leaveTime(id, user);
    return new GenericResponse('attendance updated', result);
  }

  @ApiOkResponse({ description: 'Employee updated successfully' })
  @ApiOperation({ summary: 'Update employee info' })
  @HttpCode(200)
  @Patch('update')
  @ApiBody({ type: UpdateUserEmployeeDto })
  async update(@GetUser() user: User, @Body() dto: UpdateUserEmployeeDto) {
    const result = await this.employeeService.update(user, dto);
    return new GenericResponse('employee updated', result);
  }

  @Patch('reset-password')
  @ApiBody({ type: resetPasswordDto })
  @ApiCreatedResponse({ description: 'Password reseted' })
  @ApiOperation({ summary: 'Reset user password' })
  async resetPassword(@Body() dto: resetPasswordDto, @GetUser() user: User) {
    await this.employeeService.resetPassword(dto, user);
    return new GenericResponse('Password reseted', null);
  }
}
