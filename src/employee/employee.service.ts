import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Employee } from 'src/__shared__/models/employee.entity';
import { User } from 'src/__shared__/models/user.entity';
import { Repository } from 'typeorm/repository/Repository';
import { resetPasswordDto, UpdateUserEmployeeDto } from './dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async update(user: User, dto: UpdateUserEmployeeDto) {
    const isUser = await this.employeeRepository.findOne({
      where: {
        user,
      },
    });
    if (!isUser) {
      throw new NotFoundException('User not found');
    }
    await this.employeeRepository.update(isUser.id, { ...dto });
    return;
  }

  async resetPassword(dto: resetPasswordDto, user: User) {
    const password = await bcrypt.hash(dto.password, 8);
    await this.userRepository.update(user.id, { password });
    return 'password updated';
  }
}
