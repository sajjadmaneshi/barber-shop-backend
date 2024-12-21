import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../data/entities/user.entity';
import { UserService } from './user.service';
import { UpdateUserDto } from '../data/DTO/user/update-user.dto';
import { VerifyOtpDto } from '../data/DTO/user/verify-otp.dto';
import { AddUserDto } from "../data/DTO/user/add-user.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly _userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public getTokenForUser(user: UserEntity): string {
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
          lastLogin: new Date(),
        } as UpdateUserDto);
      } else {
        const user = {
          mobileNumber,
          otp,
          role: 'CUSTOMER',
          lastLogin:new Date()
        } as AddUserDto;
        await this._userService.registerCustomer(user);
      }
      return otp;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async validateOtp(validateOtpDto: VerifyOtpDto): Promise<UserEntity> {
    const user = await this._userService.getUserByMobileNumber(
      validateOtpDto.mobileNumber,
    );

    if (!user) {
      throw new UnauthorizedException(
        `User with number ${validateOtpDto.mobileNumber} not found`,
      );
    }

    if (validateOtpDto.verificationCode !== user.otp) {
      this.logger.debug('Verification code is incorrect');
      throw new BadRequestException('Verification code is incorrect');
    }

    return user;
  }
}
