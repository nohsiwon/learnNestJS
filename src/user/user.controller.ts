import { Body, Controller, Get, Post, Req } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/login')
  async login(@Body() loginUserDTO: LoginUserDto) {
    return await this.userService.login(loginUserDTO);
  }

  @Post('/signup')
  async createUser(@Body() createUserDTO: CreateUserDto) {
    return await this.userService.create(createUserDTO);
  }

  @Get('/check')
  checkUser(@Req() req: any) {
    const userPayload = req.user;
    return this.userService.checkUser(userPayload);
  }
}
