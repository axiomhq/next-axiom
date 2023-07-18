import type { Config } from 'jest';
import { defaults } from 'jest-config'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', ...defaults.moduleFileExtensions]
};
export default config;
