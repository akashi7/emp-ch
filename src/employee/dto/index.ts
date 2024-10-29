import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserEmployeeDto } from 'src/auth/dto';

export class UpdateUserEmployeeDto extends OmitType(UserEmployeeDto, [
  'email',
  'password',
  'role',
] as const) {}

export class resetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
    default: 'P!oopasd',
  })
  password: string;
}
