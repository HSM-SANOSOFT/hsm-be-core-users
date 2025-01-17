import 'dotenv/config';

import * as dotenv from 'dotenv';
import * as joi from 'joi';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../../kubernetes/envs/global.env'),
});
dotenv.config({
  path: path.resolve(__dirname, '../../../kubernetes/envs/personal.env'),
});

interface EnvVars {
  PERSONAL_MICROSERVICE_HOST: string;
  PERSONAL_MICROSERVICE_PORT: number;

  DB_USER: string;
  DB_PASSWORD: string;
  DB_CONNECTION_STRING: string;
  ORACLE_CLIENT_PATH: string;
}

const envsSchema = joi
  .object({
    PERSONAL_MICROSERVICE_HOST: joi.string().default('localhost'),
    PERSONAL_MICROSERVICE_PORT: joi.number().required(),

    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_CONNECTION_STRING: joi.string().required(),
    ORACLE_CLIENT_PATH: joi.string().default('C:/ORACLE/instantclient_12_1'),
  })
  .unknown()
  .required();

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  PERSONAL_MICROSERVICE_HOST: envVars.PERSONAL_MICROSERVICE_HOST,
  PERSONAL_MICROSERVICE_PORT: envVars.PERSONAL_MICROSERVICE_PORT,

  DB_USER: envVars.DB_USER,
  DB_PASSWORD: envVars.DB_PASSWORD,
  DB_CONNECTION_STRING: envVars.DB_CONNECTION_STRING,
  ORACLE_CLIENT_PATH: envVars.ORACLE_CLIENT_PATH,
};
