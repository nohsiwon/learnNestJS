import _ from 'lodash';
import { Repository } from 'typeorm';

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreatePostDto } from './dto/create-post.dto';
import { RemovePostDTO } from './dto/remove-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    return (await this.postRepository.save(createPostDto)).id;
  }

  async findAll() {
    return await this.postRepository.find({
      where: { deletedAt: null },
      select: ['id', 'title', 'updatedAt'],
    });
  }

  async findOne(id: number) {
    return await this.postRepository.findOne({
      where: { id, deletedAt: null },
      select: ['title', 'content', 'updatedAt'],
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const { content, password } = updatePostDto;
    const post = await this.postRepository.findOne({
      select: ['password'],
      where: { id },
    });

    if (_.isNil(post)) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    if (!_.isNil(post.password) && post.password !== password) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    await this.postRepository.update({ id }, { content });
  }

  async remove(id: number, removePostDto: RemovePostDTO) {
    const { password } = removePostDto;

    const post = await this.postRepository.findOne({
      select: ['password'],
      where: { id },
    });

    if (_.isNil(post)) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    if (!_.isNil(post.password) && post.password !== password) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return this.postRepository.softDelete({ id });
  }
}
