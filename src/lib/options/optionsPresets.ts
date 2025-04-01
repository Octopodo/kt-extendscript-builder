import { BuildOptions } from '../../types';

export const presets: Record<string, Partial<BuildOptions>> = {
    build: {
        input: 'src/index.ts',
        output: 'dist/index.js',
        test: false,
        'tsconfig-template': true
    },
    watch: {
        input: 'src/index.ts',
        output: 'dist/index.js',
        'tsconfig-template': true,
        watch: true,
        test: false
    },
    test: {
        input: 'src/tests/index.test.ts',
        output: 'dist.test/index.test.js',
        'tsconfig-template': true,
        test: true
    }
};

presets.default = presets.build;
