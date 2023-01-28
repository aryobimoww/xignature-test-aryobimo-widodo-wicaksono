/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersDto } from './users.dto';
import { ValidationPipe } from '@nestjs/common/pipes';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';

@Controller()
export class UsersController {
  constructor(
    private readonly UsersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  getAllUsers() {
    return this.UsersService.getAll();
  }
  @Post('register')
  createUsers(@Body(ValidationPipe) data: UsersDto) {
    return this.UsersService.create(data);
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.UsersService.auth({
      where: { username: username },
    });
    if (!user) {
      throw new BadRequestException('invalid credential');
    }
    if (password !== user.password) {
      throw new BadRequestException('invalid credential');
    }
    const payload = { id: user.id };

    const jwt = await this.jwtService.signAsync(payload);

    response.cookie('jwt', jwt, { httpOnly: true });

    return { message: 'login success' };
  }
  @Get('user')
  async user(@Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);
      if (!data) {
        throw new UnauthorizedException();
      }
      const user = await this.UsersService.auth({ where: { id: data['id'] } });
      const { password, ...res } = user;
      return res;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @Post()
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return { message: 'logout success' };
  }
  @Put('user/:id')
  async update(@Body() data: UsersDto, @Param('id') id: number) {
    return await this.UsersService.update(data, +id);
  }

  @Delete('user/:id')
  async delete(@Param('id') id: number) {
    return await this.UsersService.delete(+id);
  }
}
