import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from '../data/entities/user.entity';
import { UserService } from '../services/user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserInfoDto } from '../data/DTO/profile/update-user-info.dto';
import { Account } from '../common/controller-names';
import { ProfileResponseViewModel } from '../data/models/profile-response.view-model';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { ChangeRoleDto } from '../data/DTO/user/change-role.dto';
import { SendOtpDto } from '../data/DTO/user/send-otp.dto';
import { VerifyOtpDto } from '../data/DTO/user/verify-otp.dto';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';

@ApiTags(Account)
@Controller(Account)
@ApiBearerAuth()
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(
    private readonly _userService: UserService,
    private readonly _roleService: RoleService,
    private readonly _authService: AuthService,
  ) {}

  @ApiCreatedResponse()
  @ApiBody({ type: SendOtpDto })
  @Post('sendOtp')
  async sendOtp(@Body() sendOtpInput: SendOtpDto) {
    return await this._authService.registerUser(sendOtpInput.mobileNumber);
  }

  @Post('verifyOtp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const user = await this._authService.validateOtp(verifyOtpDto);
    return {
      token: this._authService.getTokenForUser(user),
      isRegistered: user.isRegistered,
    };
  }

  @Get()
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async findAll() {
    this.logger.log('hit the find All route');
    const users = await this._userService.getUsers();
    this.logger.debug(`found ${users.length}`);
    return users;
  }

  @Get('roles')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async findAllRoles() {
    const roles = await this._roleService.getRoles();
    this.logger.debug(`found ${roles.length}`);
    return roles;
  }

  @Get('profile')
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({
    type: ProfileResponseViewModel,
  })
  async getProfile(@CurrentUser() user: UserEntity) {
    this.logger.log('hit the get profile');
    const userId = user.id;
    return await this._userService.getUserProfile(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this._userService.getUser(id);
  }

  @Put('completeInfo')
  @UseGuards(AuthGuardJwt)
  @ApiBody({ type: UpdateUserInfoDto })
  @HttpCode(201)
  async completeInfo(
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateUserInfoDto,
  ) {
    const userId = user.id;
    return await this._userService.completeInfo(userId, dto);
  }

  @Put('changeRole')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: ChangeRoleDto })
  async changeRole(@Body() dto: ChangeRoleDto) {
    await this._userService.changeRole(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return await this._userService.removeUser(id);
  }
}
