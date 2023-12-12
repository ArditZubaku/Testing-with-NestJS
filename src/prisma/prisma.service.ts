import { Prisma, PrismaClient } from '@prisma/client';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;

    const models = Prisma.dmmf.datamodel.models.map((model) =>
      this.toCamelCase(model.name),
    );

    try {
      models.forEach(async (model) => await this[model].deleteMany());
    } catch (error) {
      console.error('Error in cleanDatabase:', error);
    }
  }

  private toCamelCase(input: string): string {
    const words = input.match(/[A-Z][a-z]+|[a-z]+/g) || [];
    return words
      .map((word: string, index: number) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join('');
  }
}
