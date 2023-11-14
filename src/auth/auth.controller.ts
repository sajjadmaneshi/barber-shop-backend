import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { SendOtpDto } from './input/dto/send-otp.dto';
import { VerifyOtpDto } from './input/dto/verify-otp.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @ApiCreatedResponse()
  @ApiBody({ type: SendOtpDto })
  @Post('sendOtp')
  async sendOtp(@Body() sendOtpInput: SendOtpDto) {
    return await this._authService.registerUser(sendOtpInput.mobileNumber);
  }

  @Post('verifyOtp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const user = await this._authService.validateOtp(verifyOtpDto);
    return {
      token: this._authService.getTokenForUser(user),
      isRegistered: user.isRegistered,
    };
  }
}
