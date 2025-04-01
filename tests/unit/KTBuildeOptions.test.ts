import { describe, it, expect } from 'vitest';
import { KTBuilderOptions } from '../../src/lib/options/KTBuilderOptions';

describe('KTBuilderOptions', () => {
    it('should export an array of options', () => {
        expect(Array.isArray(KTBuilderOptions)).toBe(true);
        expect(KTBuilderOptions.length).toBeGreaterThan(0);
    });

    it('each option should have the correct structure', () => {
        KTBuilderOptions.forEach((option) => {
            // Verify required properties
            expect(option).toHaveProperty('name');
            expect(option).toHaveProperty('type');
            expect(option).toHaveProperty('description');

            // Verify data types
            expect(typeof option.name).toBe('string');
            expect(typeof option.type).toBe('string');
            expect(typeof option.description).toBe('string');

            // Verify that alias is a string if it exists
            if ('alias' in option) {
                expect(typeof option.alias).toBe('string');
            }
        });
    });

    it('should not have duplicate option names', () => {
        const names = KTBuilderOptions.map((option) => option.name);
        const uniqueNames = [...new Set(names)];
        expect(names.length).toBe(uniqueNames.length);
    });

    it('should include all necessary options', () => {
        const requiredOptions = ['input', 'output', 'mode', 'watch', 'clean', 'test'];
        const names = KTBuilderOptions.map((option) => option.name);

        requiredOptions.forEach((required) => {
            expect(names).toContain(required);
        });
    });
});
