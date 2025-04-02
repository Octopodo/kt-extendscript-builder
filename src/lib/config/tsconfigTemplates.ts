// src/templates.ts
export const tsconfigES3 = {
  compilerOptions: {
    target: 'ES3',
    module: 'CommonJS',
    outDir: './dist',
    rootDir: './src',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    lib: [],
    sourceMap: true,
    types: [
      'kt-core/src/lib/json2',
      'types-for-adobe/shared/global',
      'types-for-adobe/shared/JavaScript'
    ]
  }
  // include: ['src']
};

export const tsconfigTestsES3 = {
  compilerOptions: {
    target: 'ES3',
    module: 'CommonJS',
    outDir: './dist.test',
    rootDir: './',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    lib: [],
    sourceMap: true,
    types: [
      'kt-core/src/lib/json2',
      'types-for-adobe/shared/global',
      'types-for-adobe/shared/JavaScript',
      'types-for-adobe/AfterEffects/23.0'
    ]
  },
  include: ['src/**/*', 'src/tests/**/*'],
  exclude: ['node_modules', 'dist']
};
