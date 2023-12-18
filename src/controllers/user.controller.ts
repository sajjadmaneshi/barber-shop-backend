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
import { User } from '../data/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../services/user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddProfileDto } from '../data/DTO/profile/add-profile.dto';
import { Profile } from '../data/entities/profile.entity';
import { UpdateProfileDto } from '../data/DTO/profile/update-profile.dto';
import { Users } from '../common/controller-names';
import { DocumentService } from '../services/document.service';
import { DocumentEntity } from '../data/entities/document.entity';
import { ProfileResponseViewModel } from '../data/models/profile-response.view-model';

@ApiTags(Users)
@Controller(Users)
@ApiBearerAuth()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly _profileRepository: Repository<Profile>,
    private readonly userService: UserService,
    private readonly documentService: DocumentService,
  ) {}

  @Get()
  async findAll() {
    this.logger.log('hit the find All route');
    const users = await this._userRepository.find();
    this.logger.debug(`found ${users.length}`);
    return users;
  }
  @Get('getProfile')
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({
    type: ProfileResponseViewModel,
  })
  async getProfile(@CurrentUser() user: User) {
    if (user.profile) {
      const { avatar, ...rest } = user.profile;
      return { ...rest, avatarId: user.profile.avatar ? avatar.id : null };
    } else throw new BadRequestException('user profile not found');
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
    let resultId: string;
    const queryRunner =
      this._userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const profile = new Profile();
      profile.firstname = dto.firstname;
      profile.lastname = dto.lastname;
      profile.gender = dto.gender;
      let document: DocumentEntity | null = null;
      if (dto.avatarId) {
        document = await this.documentService.findOne(dto.avatarId);
        if (!document) throw new BadRequestException('avatar not found');
      }
      profile.avatar = document;
      await this._profileRepository.save(profile);
      user.profile = profile;
      user.isRegistered = true;
      const result = await this._userRepository.save(user);
      resultId = result.id;
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
    return resultId;
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
      return user.profile.id;
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
