import { UserRole } from '../user-role.entity';

export class AddUserDto {
  mobileNumber: string;
  otp: string;

  role: UserRole;

  isRegistered: boolean = false;
}
