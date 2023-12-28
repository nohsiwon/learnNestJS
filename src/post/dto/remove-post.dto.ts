/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/mapped-types';

import { CreatePostDto } from './create-post.dto';

export class RemovePostDTO extends PickType(CreatePostDto, ['password']) {}
