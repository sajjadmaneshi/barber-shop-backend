import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '../data/entities/user.entity';
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
import { ProfileEntity } from '../data/entities/profile.entity';
import { UpdateProfileDto } from '../data/DTO/profile/update-profile.dto';
import { Users } from '../common/controller-names';
import { DocumentService } from '../services/document.service';
import { DocumentEntity } from '../data/entities/document.entity';
import { ProfileResponseViewModel } from '../data/models/profile-response.view-model';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { RoleEnum } from '../common/enums/roleEnum';
import { ChangeRoleDto } from '../data/DTO/user/change-role.dto';

@ApiTags(Users)
@Controller(Users)
@ApiBearerAuth()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private readonly _profileRepository: Repository<ProfileEntity>,
    private readonly userService: UserService,
    private readonly documentService: DocumentService,
  ) {}

  @Get()
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async findAll() {
    this.logger.log('hit the find All route');
    const users = await this.userService.getUsers();
    this.logger.debug(`found ${users.length}`);
    return users;
  }
  @Get('profile')
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({
    type: ProfileResponseViewModel,
  })
  async getProfile(@CurrentUser() user: UserEntity) {
    this.logger.log('hit the get profile');
    if (user.profile) {
      const { avatar, ...rest } = user.profile;
      return {
        ...rest,
        avatarId: user.profile.avatar ? avatar.id : null,
        mobileNumber: user.mobileNumber,
      };
    } else throw new BadRequestException('user profile not found');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.getUser(id);
  }

  @Post('profile')
  @UseGuards(AuthGuardJwt)
  @ApiBody({ type: AddProfileDto })
  @HttpCode(201)
  async completeProfile(
    @CurrentUser() user: UserEntity,
    @Body() dto: AddProfileDto,
  ) {
    let resultId: string;
    const queryRunner =
      this._userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const profile = new ProfileEntity();
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
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateProfileDto,
  ) {
    if (user.profile) {
      user.profile.firstname = dto.firstname;
      user.profile.lastname = dto.lastname;
      user.profile.gender = dto.gender;
      if (dto.avatarId) {
        const document = await this.documentService.findOne(dto.avatarId);
        if (!document) throw new BadRequestException('avatar not found');
        user.profile.avatar = document;
      } else user.profile.avatar = null;

      await this._userRepository.save(user);
      return user.profile.id;
    } else {
      throw new BadRequestException('user profile NotFound');
    }
  }

  @Put('changeRole')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: ChangeRoleDto })
  async changeRole(@Body() dto: ChangeRoleDto) {
    await this.userService.changeRole(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return await this.userService.removeUser(id);
  }
}
