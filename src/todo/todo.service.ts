import { Todo } from '@prisma/client';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTodoDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async createTodo(userId: number, dto: CreateTodoDto): Promise<Todo> {
    try {
      return await this.prisma.todo.create({
        data: {
          userId,
          ...dto,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Duplicate todo title');
        }
      }
      throw error;
    }
  }
}
