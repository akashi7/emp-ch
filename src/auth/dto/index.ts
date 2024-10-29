import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ERoles } from 'src/__shared__/enums/enum';

export class UserEmployeeDto {
  @ApiProperty({ type: String, required: true, default: 'akashi@gmail.com' })
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, default: 'akashi' })
  password: string;

  @ApiProperty({ required: true, enum: ERoles })
  @IsNotEmpty()
  @IsEnum(ERoles)
  role: ERoles;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, default: 'Akashi' })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, default: 'Christian' })
  lastName: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, default: '078120' })
  phoneNumber: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, default: 'EMP10156' })
  identifier: string;
}

export class forgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
    default: 'christiannseko@gmail.com',
  })
  email: string;
}

export class VerifyUserDto {
  @ApiProperty({
    type: String,
    required: true,
    default: 'eTYtffyvytvpppn',
  })
  @IsString()
  token: string;
}
