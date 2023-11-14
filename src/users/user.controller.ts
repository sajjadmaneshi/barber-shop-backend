import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuardJwt } from '../auth/guards/auth-guard.jwt';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { Profile } from './entities/profile.entity';

@ApiTags('users')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly userService: UserService,
  ) {}

  @Get()
  async findAll() {
    this.logger.log('hit the find All route');
    const users = await this.repository.find();
    this.logger.debug(`found ${users.length}`);
    return users;
  }
  @Get('getProfile')
  @UseGuards(AuthGuardJwt)
  async getProfile(@CurrentUser() user: User) {
    if (user.profile) return user.profile;
    else throw new BadRequestException({ message: 'user profile not found' });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.getUser(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Post('completeProfile')
  @UseGuards(AuthGuardJwt)
  @ApiBody({ type: CompleteProfileDto })
  async completeProfile(
    @CurrentUser() user: User,
    @Body() dto: CompleteProfileDto,
  ) {
    const profile = new Profile();
    profile.firstname = dto.firstname;
    profile.lastname = dto.lastname;
    profile.gender = dto.gender;
    user.profile = profile;
    user.isRegistered = true;
    await this.repository.save(user);
    return user;
  }

  @Patch('updateProfile')
  @UseGuards(AuthGuardJwt)
  @ApiBody({ type: CompleteProfileDto })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: CompleteProfileDto,
  ) {
    if (user.profile) {
      user.profile.firstname = dto.firstname;
      user.profile.lastname = dto.lastname;
      user.profile.gender = dto.gender;
      await this.repository.save(user);
      return user;
    } else {
      throw new BadRequestException('user profile NotFound');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const user = await this.repository.findOne({ where: { id: id } });
    await this.repository.remove(user);
  }
}
