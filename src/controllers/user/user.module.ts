import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserRole } from './user-role.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
