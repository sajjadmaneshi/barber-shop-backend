import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from '../controllers/auth.controller';
import { UserRole } from '../data/entities/user-role.entity';
import { User } from '../data/entities/user.entity';
import { Profile } from '../data/entities/profile.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
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
