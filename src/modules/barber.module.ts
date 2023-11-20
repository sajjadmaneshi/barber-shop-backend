import { Module } from '@nestjs/common';
import { BarberController } from '../controllers/barber.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Barber } from '../data/entities/barber.entity';
import { BarberService } from '../services/barber.service';
import { User } from '../data/entities/user.entity';
import { UserRole } from '../data/entities/user-role.entity';
import { Profile } from '../data/entities/profile.entity';
import { RoleService } from '../services/role.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Profile, Barber])],

  controllers: [BarberController],
  providers: [RoleService, BarberService],
})
export class BarberModule {}
