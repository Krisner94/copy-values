module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Procura por arquivos de teste em todo o projeto
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
};
