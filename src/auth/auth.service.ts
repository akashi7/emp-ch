import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { IAppConfig } from 'src/__shared__/interfaces';

import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Employee } from 'src/__shared__/models/employee.entity';
import { User } from 'src/__shared__/models/user.entity';
import { MailsService } from 'src/mails/mails.service';
import { Repository } from 'typeorm';
import { forgotPasswordDto, UserEmployeeDto, VerifyUserDto } from './dto';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly Jwt: JwtService,
    private readonly config: ConfigService<IAppConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly mail: MailsService,
  ) {}

  private generateUserToken(user: User, verification?: boolean) {
    const { id, role, email } = user;

    const token = this.Jwt.sign(
      { id, role, email },
      { secret: this.config.get('jwt').secret },
    );
    delete user.password;

    if (verification) {
      return token;
    }

    return {
      data: {
        user,
        token,
      },
    };
  }

  private async sendEmail(
    user: User,
    token: { data: { user: User; token: string } } | string,
  ) {
    const userT = await this.userRepository.findOne({ where: { id: user.id } });
    const employee = await this.employeeRepository.findOne({
      where: { user: userT },
    });
    const resetPasswordUrl = `http://localhost:${this.config.get(
      'port',
    )}/api/v1/auth/resetPassword?token=${token}`;

    const result = await this.mail.sendMail(
      `${user.email}`,
      'Reset password',
      `"No Reply" <${this.config.get('mail').from}>`,
      {
        username: `${employee.firstName} ${employee.lastName}`,
        verificationUrl: resetPasswordUrl,
      },
      './forgotPassword.template.hbs',
      [],
    );
    return result;
  }

  async createUser(dto: UserEmployeeDto) {
    const isUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (isUser) {
      throw new ConflictException('User by email already exist');
    }
    const password = await bcrypt.hash(dto.password, 8);
    const user = this.userRepository.create({
      email: dto.email,
      role: dto.role,
      password,
    });
    await this.userRepository.save(user);
    if (user) {
      const employee = this.employeeRepository.create({
        user,
        firstName: dto.firstName,
        lastName: dto.lastName,
        identifier: dto.identifier,
        phoneNumber: dto.phoneNumber,
      });
      await this.employeeRepository.save(employee);
      return this.generateUserToken(user);
    }
  }

  async loginUser(dto: User) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    } else if (!(await bcrypt.compare(dto.password, user.password))) {
      throw new ForbiddenException('Wrong User password');
    }
    return this.generateUserToken(user);
  }

  async EmailForgotPassword(dto: forgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) throw new NotFoundException('User not found');
    const token = this.generateUserToken(user, true);
    const message = this.sendEmail(user, token);
    return {
      data: {
        message,
        user,
      },
    };
  }

  async verifyUserOnReset(dto: VerifyUserDto) {
    try {
      const payload: JwtPayload = this.Jwt.verify(dto.token, {
        secret: this.config.get('jwt').secret,
      });
      const user = await this.userRepository.findOne({
        where: { email: payload.email },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return this.generateUserToken(user);
    } catch (error) {
      console.log({ error });
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
