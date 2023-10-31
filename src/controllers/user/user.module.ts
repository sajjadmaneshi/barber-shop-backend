import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserRole } from './user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User])],
  controllers: [UserController],
})
export class UserModule {}
