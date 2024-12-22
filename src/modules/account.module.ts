import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../data/entities/user.entity';
import { UserRoleEntity } from '../data/entities/user-role.entity';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { DocumentService } from '../services/document.service';
import { DocumentEntity } from '../data/entities/document.entity';
import { AccountController } from '../controllers/account.controller';
import { CustomerEntity } from '../data/entities/customer.entity';
import { CustomerService } from '../services/customer.service';
import { AuthService } from '../services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from "../common/guards/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRoleEntity,
      CustomerEntity,
      UserEntity,
      DocumentEntity,
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.AUTH_SECRET,
        signOptions: {
          expiresIn: '365d',
        },
      }),
    }),
  ],
  providers: [
    RoleService,
    CustomerService,
    JwtStrategy,
    AuthService,
    UserService,
    DocumentService,
  ],
  controllers: [AccountController],
})
export class AccountModule {}
