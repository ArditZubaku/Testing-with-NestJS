import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { TodoService } from 'src/todo/todo.service';
import { CreateTodoDto } from 'src/todo/dto';
import { TodoStatus } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

describe('TodoService Integration test', () => {
  let prisma: PrismaService;
  let todoService: TodoService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    todoService = moduleRef.get(TodoService);

    await prisma.cleanDatabase();
  });

  describe('createToDo()', () => {
    let userID: number;
    const dto: CreateTodoDto = {
      title: faker.word.noun(),
      description: faker.lorem.words(),
    };

    it('should create user', async () => {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          firstName: faker.internet.userName(),
          lastName: faker.internet.userName(),
        },
      });

      userID = user.id;
    });

    it('should create todo', async function () {
      const todo = await todoService.createTodo(userID, dto);

      expect(todo.title).toBe(dto.title);
      expect(todo.description).toBe(dto.description);
      expect(todo.status).toBe(TodoStatus.OPEN);
    });

    it('should throw error on duplicate title', async function () {
      await todoService
        .createTodo(userID, dto)
        .then((todo) => expect(todo).toBeUndefined())
        .catch((error) => expect(error.status).toBe(HttpStatus.FORBIDDEN));
    });
  });
});
