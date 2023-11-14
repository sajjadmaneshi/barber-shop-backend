import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { UserRole } from '../users/entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';
import { UserService } from '../users/user.service';
import { RoleService } from '../services/role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRole, User, Profile]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.AUTH_SECRET,
        signOptions: {
          expiresIn: '365d',
        },
      }),
    }),
  ],

  controllers: [AuthController],
  providers: [UserService, RoleService, AuthService],
})
export class AuthModule {}
