import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tests/tsconfig.json',
      },
    ],
  },
};

export default config;
