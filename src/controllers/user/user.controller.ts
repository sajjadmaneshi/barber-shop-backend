import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  @Get()
  async findAll() {
    return this.repository.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.repository.findOne({
      where: {
        id: id,
      },
    });
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
