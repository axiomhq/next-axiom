import { defaults } from 'jest-config'
import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', ...defaults.moduleFileExtensions]
};
export default config;
