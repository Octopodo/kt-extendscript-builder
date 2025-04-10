import { BuildOptions } from '../../types';

export const presets: Record<string, Partial<BuildOptions>> = {
    build: {
        input: 'src/index.ts',
        output: 'dist/index.js',
        test: false,
        mode: 'production'
    },
    dev: {
        input: 'src/index.ts',
        output: 'dist/index.js',
        watch: false,
        test: false,
        mode: 'development'
    },
    watch: {
        input: 'src/index.ts',
        output: 'dist/index.js',
        'tsconfig-template': true,
        watch: true,
        test: false,
        mode: 'development'
    },
    test: {
        input: 'src/tests/index.test.ts',
        output: 'dist.test/index.test.js',
        'tsconfig-template': true,
        test: true,
        mode: 'development',
        watch: false
    }
};

presets.default = presets.build;
