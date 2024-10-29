import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/__shared__/models/user.entity';
import { AuthService } from './auth.service';
import { forgotPasswordDto, UserEmployeeDto, VerifyUserDto } from './dto';

@Controller('auth')
@ApiTags('auth')
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiOperation({ summary: 'user registration' })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiBody({ type: UserEmployeeDto })
  @Post('sign-up')
  async userSignUp(@Body() dto: UserEmployeeDto) {
    return await this.authService.createUser(dto);
  }

  @ApiOkResponse({ description: 'User logged in successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden User' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOperation({ summary: 'user login' })
  @ApiBody({ type: User })
  @HttpCode(200)
  @Post('login')
  async userLogin(@Body() dto: User) {
    const result = await this.authService.loginUser(dto);
    return result;
  }

  @ApiOkResponse({ description: 'Email sent for  User' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOperation({ summary: 'User forgot password' })
  @ApiBody({ type: forgotPasswordDto })
  @HttpCode(200)
  @Post('forgot-password')
  async verifyUserForResetingPassword(@Body() dto: forgotPasswordDto) {
    const result = await this.authService.EmailForgotPassword(dto);
    return result;
  }

  @ApiExcludeEndpoint()
  @ApiOkResponse({ description: 'Verify User ' })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOperation({ summary: 'User verification while reseting password' })
  @ApiQuery({ type: VerifyUserDto })
  @HttpCode(200)
  @Get('resetPassword')
  async verifyUserOnReset(@Query() dto: VerifyUserDto) {
    const result = await this.authService.verifyUserOnReset(dto);
    return result;
  }
}
