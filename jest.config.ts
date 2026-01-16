import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },

  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s',
    '!<rootDir>/src/**/*.spec.ts',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/*.controller.ts',
    '!<rootDir>/src/**/*.module.ts',
    '!<rootDir>/src/**/*.decorator.ts',
    '!<rootDir>/src/**/*.middleware.ts',
    '!<rootDir>/src/**/*.interceptor.ts',
    '!<rootDir>/src/**/*.guard.ts',
    '!<rootDir>/src/**/*.dto.ts',
    '!<rootDir>/src/**/*.entity.ts',
    '!<rootDir>/src/modules/typed-config/env.zod.ts',
    '!<rootDir>/src/modules/typed-config/configs/*',
    '!<rootDir>/src/modules/**/*-seed.service.ts',
    '!<rootDir>/src/*-export.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'clover', 'cobertura'],
  clearMocks: true,
  restoreMocks: true,
};

export default config;
