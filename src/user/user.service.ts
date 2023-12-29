import _ from 'lodash';
import { Repository } from 'typeorm';

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService, // JWT 토큰 생성을 위해 주입한 서비스
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { userId, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { userId, deletedAt: null },
      select: ['id', 'password'],
    });

    if (_.isNil(user)) {
      throw new NotFoundException(`유저를 찾을 수 없습니다. ID: ${userId}`);
    }

    if (user.password !== password) {
      throw new UnauthorizedException(
        `유저의 비밀번호가 올바르지 않습니다. ID: ${userId}`,
      );
    }

    // 추가된 코드 - JWT 토큰 생성
    const payload = { id: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.findOne(createUserDto.userId);
    if (!_.isNil(existUser)) {
      throw new ConflictException(
        `이미 가입된 ID입니다. ID: ${createUserDto.userId}`,
      );
    }

    const newUser = await this.userRepository.save(createUserDto);

    // 추가된 코드 - JWT 토큰 생성
    const payload = { id: newUser.id };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  checkUser(userPayload: any) {
    return `유저 정보: ${JSON.stringify(userPayload)}}`;
  }

  private async findOne(userId: string) {
    return await this.userRepository.findOne({
      where: { userId, deletedAt: null },
      select: ['userId', 'createdAt', 'updatedAt'],
    });
  }
}
