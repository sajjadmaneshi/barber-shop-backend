import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AddUserDto } from './dto/add-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('/user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  @Get()
  async findAll() {
    this.logger.log('hit the find All route');
    const users = await this.repository.find();
    this.logger.debug(`found ${users.length}`);
    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = this.repository.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Post()
  async create(@Body() input: AddUserDto) {
    return await this.repository.save({
      ...input,
    });
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() input: UpdateUserDto) {
    const user = await this.repository.findOne({ where: { id: id } });
    return await this.repository.save({
      ...user,
      ...input,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: number) {
    const user = await this.repository.findOne({ where: { id: id } });
    await this.repository.remove(user);
  }
}
