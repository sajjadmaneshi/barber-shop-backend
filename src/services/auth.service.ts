import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UserService } from '../users/user.service';
import { UpdateUserDto } from '../auth/input/dto/update-user.dto';
import { VerifyOtpDto } from '../auth/input/dto/verify-otp.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly _userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public getTokenForUser(user: User): string {
    return this.jwtService.sign({
      mobileNumber: user.mobileNumber,
      role: user.role.name.toUpperCase(),
      sub: user.id.toString(),
    });
  }

  generateOTP(): string {
    const otpLength = 6;
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }

  async registerUser(mobileNumber: string): Promise<string> {
    try {
      const existingUser =
        await this._userService.getUserByMobileNumber(mobileNumber);
      const otp = this.generateOTP();

      if (existingUser) {
        await this._userService.updateUser(existingUser.id, {
          otp,
        } as UpdateUserDto);
      } else {
        const user = {
          mobileNumber,
          otp,
          role: 'CUSTOMER',
        };
        await this._userService.createUser(user);
      }
      return otp;
    } catch (error: any) {
      throw new BadRequestException({ error: error.message });
    }
  }

  async validateOtp(validateOtpDto: VerifyOtpDto): Promise<User> {
    const user = await this._userService.getUserByMobileNumber(
      validateOtpDto.mobileNumber,
    );

    if (!user) {
      this.logger.debug(
        `User with number ${validateOtpDto.mobileNumber} not found`,
      );
      throw new UnauthorizedException({
        message: `User with number ${validateOtpDto.mobileNumber} not found`,
      });
    }

    if (validateOtpDto.verificationCode !== user.otp) {
      this.logger.debug('Verification code is incorrect');
      throw new UnauthorizedException('Verification code is incorrect');
    }

    return user;
  }
}
