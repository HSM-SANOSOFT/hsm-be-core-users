import 'dotenv/config';

import * as dotenv from 'dotenv';
import * as joi from 'joi';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../../kubernetes/envs/global.env'),
});
dotenv.config({
  path: path.resolve(__dirname, '../../../kubernetes/envs/users.env'),
});

interface EnvVars {
  USER_MICROSERVICE_NAME: string;
  USERS_MICROSERVICE_HOST: string;
  USERS_MICROSERVICE_PORT: number;

  DB_USER: string;
  DB_PASSWORD: string;
  DB_CONNECTION_STRING: string;
  LD_LIBRARY_PATH: string;

  AUTH_MICROSERVICE_NAME: string;
  AUTH_MICROSERVICE_HOST: string;
  AUTH_MICROSERVICE_PORT: number;

  COMS_MICROSERVICE_NAME: string;
  COMS_MICROSERVICE_HOST: string;
  COMS_MICROSERVICE_PORT: number;
}

const envsSchema = joi
  .object({
    USER_MICROSERVICE_NAME: joi.string().required(),
    USERS_MICROSERVICE_HOST: joi.string().default('localhost'),
    USERS_MICROSERVICE_PORT: joi.number().required(),

    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_CONNECTION_STRING: joi.string().required(),
    LD_LIBRARY_PATH: joi.string().default('C:/ORACLE/instantclient_12_1'),

    AUTH_MICROSERVICE_NAME: joi.string().required(),
    AUTH_MICROSERVICE_HOST: joi.string().default('localhost'),
    AUTH_MICROSERVICE_PORT: joi.number().required(),

    COMS_MICROSERVICE_NAME: joi.string().required(),
    COMS_MICROSERVICE_HOST: joi.string().default('localhost'),
    COMS_MICROSERVICE_PORT: joi.number().required(),
  })
  .unknown()
  .required();

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  USER_MICROSERVICE_NAME: envVars.USER_MICROSERVICE_NAME,
  USERS_MICROSERVICE_HOST: envVars.USERS_MICROSERVICE_HOST,
  USERS_MICROSERVICE_PORT: envVars.USERS_MICROSERVICE_PORT,

  DB_USER: envVars.DB_USER,
  DB_PASSWORD: envVars.DB_PASSWORD,
  DB_CONNECTION_STRING: envVars.DB_CONNECTION_STRING,
  LD_LIBRARY_PATH: envVars.LD_LIBRARY_PATH,

  AUTH_MICROSERVICE_NAME: envVars.AUTH_MICROSERVICE_NAME,
  AUTH_MICROSERVICE_HOST: envVars.AUTH_MICROSERVICE_HOST,
  AUTH_MICROSERVICE_PORT: envVars.AUTH_MICROSERVICE_PORT,

  COMS_MICROSERVICE_NAME: envVars.COMS_MICROSERVICE_NAME,
  COMS_MICROSERVICE_HOST: envVars.COMS_MICROSERVICE_HOST,
  COMS_MICROSERVICE_PORT: envVars.COMS_MICROSERVICE_PORT,
};
