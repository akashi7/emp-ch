import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ERoles } from 'src/__shared__/enums/enum';
import { Employee } from 'src/__shared__/models/employee.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { CustomEntity } from '../../__shared__/models/global';
import { Attendance } from './attendance.entity';

@Entity('users')
export class User extends CustomEntity {
  @Column({ unique: true })
  @IsEmail()
  @ApiProperty({ type: String, required: true, default: 'akashi@gmail.com' })
  email: string;

  @Column()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, default: 'akashi' })
  password: string;

  @Column()
  @Exclude()
  role: ERoles;

  @Column({ default: true })
  @Exclude()
  isActive: boolean;

  @OneToOne(() => Employee, (employee) => employee.user)
  employee: Employee;

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendance: Attendance[];
}
