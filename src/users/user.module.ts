import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { UserService } from './user.service';
import { Profile } from './entities/profile.entity';
import { RoleService } from '../services/role.service';
import { JwtStrategy } from '../auth/guards/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User, Profile])],
  providers: [RoleService, JwtStrategy, UserService],
  controllers: [UserController],
})
export class UserModule {}
