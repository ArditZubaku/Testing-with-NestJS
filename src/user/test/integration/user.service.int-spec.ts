import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

describe('UserService Integration test', () => {
  let prisma: PrismaService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    userService = moduleRef.get(UserService);

    await prisma.cleanDatabase();
  });

  describe('createUser()', () => {
    const dto: Omit<User, 'createdAt' | 'id' | 'updatedAt'> = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    it('should create user', async () => {
      const user = await userService.createUser(
        dto.email,
        dto.firstName,
        dto.lastName,
      );
      expect(user.email).toBe(dto.email);
      expect(user.firstName).toBe(dto.firstName);
      expect(user.lastName).toBe(dto.lastName);
    });

    it('should throw error on duplicate title', async function () {
      try {
        await userService.createUser(dto.email, dto.firstName, dto.lastName);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
      }
    });
  });
});
