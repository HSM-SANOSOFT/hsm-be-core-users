import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('allpaciente', () => {
    it('Deberia de indicar que el codigo es incorrecto', async () => {
      // Arrange
      const payload = {
        code:813149,
        username: "DEV"
      };

      const expectedResponse = [
        {
          status: 400,
          message:"El código ingresado es incorrecto."
        },
      ];

      {
    }

      // Act
      const result = await appController.validCode(payload);

      // Assert
      expect(result).toEqual(expectedResponse);
    });
  });
});
