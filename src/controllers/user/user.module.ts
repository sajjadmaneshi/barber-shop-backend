import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserRole } from './user-role.entity';
import { UserService } from './user.service';
import { Profile } from './profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User, Profile])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
