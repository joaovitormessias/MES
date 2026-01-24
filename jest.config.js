module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts',
        '!src/**/__tests__/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@api/(.*)$': '<rootDir>/src/api/$1',
        '^@domain/(.*)$': '<rootDir>/src/domain/$1',
        '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@events/(.*)$': '<rootDir>/src/events/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
    testTimeout: 10000,
};
