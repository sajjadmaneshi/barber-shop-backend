import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../controllers/user/user.entity';
import { UserService } from '../controllers/user/user.service';
import { AddUserDto } from '../controllers/user/dto/add-user.dto';
import { UpdateUserDto } from '../controllers/user/dto/update-user.dto';

@Injectable()
export class AuthService {
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
        await this._userService.updateUser(existingUser, {
          otp,
        } as UpdateUserDto);
      } else {
        const user = {
          mobileNumber,
          otp,
        } as AddUserDto;
        await this._userService.createUser(user);
      }
      return otp;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
