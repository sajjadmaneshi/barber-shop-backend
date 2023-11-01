import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserRole } from './user-role.entity';
import { UserService } from './user.service';
import { Profile } from './profile.entity';
import { DocumentModule } from '../file/document.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRole, User, Profile]),
    DocumentModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
