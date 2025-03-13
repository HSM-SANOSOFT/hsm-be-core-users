import 'dotenv/config';

import * as dotenv from 'dotenv';
import * as joi from 'joi';
import * as path from 'path';

const pathGlobal = '../../../HSM-KUBERNETES/.env';
dotenv.config({
  path: path.resolve(__dirname, pathGlobal),
});

const pathSpecific = '../../../HSM-KUBERNETES/envs/hsm-be-core-users.env';
dotenv.config({
  path: path.resolve(__dirname, pathSpecific),
});

interface EnvVars {
  HSM_BE_CORE_USERS_NAME: string;
  HSM_BE_CORE_USERS_HOST: string;
  HSM_BE_CORE_USERS_PORT: number;

  DB_USER: string;
  DB_PASSWORD: string;
  DB_CONNECTION_STRING: string;
  LD_LIBRARY_PATH: string;
}

const envsSchema = joi
  .object({
    HSM_BE_CORE_USERS_NAME: joi.string().required(),
    HSM_BE_CORE_USERS_HOST: joi.string().default('0.0.0.0'),
    HSM_BE_CORE_USERS_PORT: joi.number().required(),

    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_CONNECTION_STRING: joi.string().required(),
    LD_LIBRARY_PATH: joi.string().default('C:/ORACLE/instantclient_12_1'),
  })
  .unknown()
  .required();

const validationSchema = envsSchema.validate(process.env);

if (validationSchema.error) {
  throw new Error(`Config validation error: ${validationSchema.error.message}`);
}

const envVars: EnvVars = validationSchema.value as EnvVars;

export const envs = {
  HSM_BE_CORE_USERS_NAME: envVars.HSM_BE_CORE_USERS_NAME,
  HSM_BE_CORE_USERS_HOST: envVars.HSM_BE_CORE_USERS_HOST,
  HSM_BE_CORE_USERS_PORT: envVars.HSM_BE_CORE_USERS_PORT,

  DB_USER: envVars.DB_USER,
  DB_PASSWORD: envVars.DB_PASSWORD,
  DB_CONNECTION_STRING: envVars.DB_CONNECTION_STRING,
  LD_LIBRARY_PATH: envVars.LD_LIBRARY_PATH,
};
