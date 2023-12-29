import { Cache } from 'cache-manager';
import _ from 'lodash';
import { Repository } from 'typeorm';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createPostDto: CreatePostDto) {
    return (await this.postRepository.save(createPostDto)).id;
  }

  async findAll() {
    const cachedArticles = await this.cacheManager.get('articles');
    if (!_.isNil(cachedArticles)) {
      return cachedArticles;
    }

    const articles = await this.postRepository.find({
      where: { deletedAt: null },
      select: ['id', 'title', 'updatedAt'],
    });
    await this.cacheManager.set('articles', articles);
    return articles;
  }

  async findOne(id: number) {
    if (_.isNaN(id)) {
      throw new BadRequestException('게시물 ID가 잘못되었습니다.');
    }

    return await this.postRepository.findOne({
      where: { id, deletedAt: null },
      select: ['title', 'content', 'updatedAt'],
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    if (_.isNaN(id)) {
      throw new BadRequestException('게시물 ID가 잘못되었습니다.');
    }

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
    if (_.isNaN(id)) {
      throw new BadRequestException('게시물 ID가 잘못되었습니다.');
    }

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

    await this.postRepository.softDelete({ id });
  }
}
