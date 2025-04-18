import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
    return {
        test: {
            globals: true,
            environment: 'node',
            exclude: ['**/node_modules/**', '**/dist/**', '**/*.js', '**/basic-project/**']
        }
    };
});
