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
import { QueryRunner, Repository } from 'typeorm';
import { User } from '../data/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../services/user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AddProfileDto } from '../data/DTO/profile/add-profile.dto';
import { Profile } from '../data/entities/profile.entity';
import { UpdateProfileDto } from '../data/DTO/profile/update-profile.dto';
import { Users } from '../common/controller-names';
import { DocumentService } from '../services/document.service';

@ApiTags(Users)
@Controller(Users)
export class UserController {
  private readonly logger = new Logger(UserController.name);
  private readonly queryRunner: QueryRunner;

  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly _profileRepository: Repository<Profile>,
    private readonly userService: UserService,
    private readonly documentService: DocumentService,
  ) {
    this.queryRunner =
      this._userRepository.manager.connection.createQueryRunner();
  }

  @Get()
  async findAll() {
    this.logger.log('hit the find All route');
    const users = await this._userRepository.find();
    this.logger.debug(`found ${users.length}`);
    return users;
  }
  @Get('getProfile')
  @UseGuards(AuthGuardJwt)
  async getProfile(@CurrentUser() user: User) {
    if (user.profile) {
      const { avatar, ...rest } = user.profile;
      return { ...rest, avatarId: user.profile.avatar ? avatar.id : null };
    } else throw new BadRequestException({ message: 'user profile not found' });
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
  @ApiBody({ type: AddProfileDto })
  @HttpCode(201)
  async completeProfile(@CurrentUser() user: User, @Body() dto: AddProfileDto) {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    try {
      const profile = new Profile();
      profile.firstname = dto.firstname;
      profile.lastname = dto.lastname;
      profile.gender = dto.gender;
      const document = await this.documentService.findOne(dto.avatarId);
      if (!document) throw new BadRequestException('avatar not found');
      profile.avatar = document;
      await this._profileRepository.save(profile);
      user.profile = profile;
      user.isRegistered = true;
      await this._userRepository.save(user);
      await this.queryRunner.commitTransaction();
    } catch (err) {
      await this.queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await this.queryRunner.release();
    }
  }

  @Patch('updateProfile')
  @UseGuards(AuthGuardJwt)
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    if (user.profile) {
      user.profile.firstname = dto.firstname;
      user.profile.lastname = dto.lastname;
      user.profile.gender = dto.gender;
      const document = await this.documentService.findOne(dto.avatarId);
      if (!document) throw new BadRequestException('avatar not found');
      user.profile.avatar = document;
      await this._userRepository.save(user);
      return user;
    } else {
      throw new BadRequestException('user profile NotFound');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const user = await this._userRepository.findOne({ where: { id: id } });
    await this._userRepository.remove(user);
  }
}
