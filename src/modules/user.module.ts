import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../controllers/user.controller';
import { User } from '../data/entities/user.entity';
import { UserRole } from '../data/entities/user-role.entity';
import { UserService } from '../services/user.service';
import { Profile } from '../data/entities/profile.entity';
import { RoleService } from '../services/role.service';
import { JwtStrategy } from '../common/guards/jwt.strategy';
import { DocumentService } from '../services/document.service';
import { DocumentEntity } from '../data/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRole, User, Profile, DocumentEntity]),
  ],
  providers: [RoleService, JwtStrategy, UserService, DocumentService],
  controllers: [UserController],
})
export class UserModule {}
