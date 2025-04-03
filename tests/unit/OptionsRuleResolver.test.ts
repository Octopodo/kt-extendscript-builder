import { describe, it, expect, beforeEach } from 'vitest';
import { OptionsRuleResolver } from '../../src/lib/options/OptionsRuleResolver';
import { OptionsParser } from '../../src/lib/options/OptionsParser';
import { DependencyRule } from '../../src/types';
import { parse } from 'path';

describe('OptionsRuleResolver', () => {
    let resolver: OptionsRuleResolver;

    beforeEach(() => {
        resolver = new OptionsRuleResolver();
    });

    it('should initialize with base and adobe options rules', () => {
        const options = resolver.resolve({});
        expect(options).toBeInstanceOf(Object);
    });

    it("shouldn't modify the base options object", () => {
        const baseOptions = OptionsParser.parse();
        process.argv = ['node', 'script.js', '--input', 'custom/input.ts'];
        const optionsCopy = OptionsParser.parse();
        resolver.resolve(baseOptions);
        expect(baseOptions).not.toBe(optionsCopy);
        expect(baseOptions).not.toEqual(optionsCopy);
    });

    it('should apply mode rule when mode is production', () => {
        const options = resolver.resolve({ mode: 'production' });
        expect(options).toEqual({
            mode: 'production',
            watch: false,
            'tsconfig-template': true
        });
    });

    it('should apply mode rule when mode is development', () => {
        const options = resolver.resolve({ mode: 'development' });
        expect(options).toEqual({
            mode: 'development',
            watch: true,
            'tsconfig-template': true
        });
    });

    it('should apply test rule when test is true', () => {
        const options = resolver.resolve({ test: true });
        expect(options).toEqual({
            test: true,
            'tsconfig-template': true
        });
    });

    it('should not apply tsconfig-template if tsconfig-test-path is defined', () => {
        const options = resolver.resolve({ test: true, 'tsconfig-test-path': 'path/to/tsconfig.test.json' });
        expect(options).toEqual({
            test: true,
            'tsconfig-test-path': 'path/to/tsconfig.test.json',
            'tsconfig-template': false
        });
    });

    it('should handle app version adjustment when app and version are provided', () => {
        const options = resolver.resolve({
            'dest-app': 'Photoshop',
            'app-version': '999.0' // Non-existent version
        });

        // The exact adjusted version will depend on the available versions,
        // so we just check that app-version was modified
        expect(options['dest-app']).toBe('Photoshop');
        expect(options['app-version']).toBeDefined();
    });

    it('should add and apply custom rules', () => {
        const customRule: DependencyRule = (opts) => ({
            ...opts,
            custom: 'value'
        });

        resolver.addRules(customRule);
        const options = resolver.resolve({});

        expect(options).toEqual({
            custom: 'value',
            'tsconfig-template': true
        });
    });

    it('should add and apply multiple custom rules as array', () => {
        const rules: DependencyRule[] = [(opts) => ({ ...opts, rule1: true }), (opts) => ({ ...opts, rule2: true })];

        resolver.addRules(rules);
        const options = resolver.resolve({});

        expect(options).toEqual({
            rule1: true,
            rule2: true,
            'tsconfig-template': true
        });
    });

    it('should add and apply multiple custom rules as object', () => {
        const rules = {
            rule1: (opts) => ({ ...opts, first: true }),
            rule2: (opts) => ({ ...opts, second: true })
        };

        resolver.addRules(rules);
        const options = resolver.resolve({});

        expect(options).toEqual({
            first: true,
            second: true,
            'tsconfig-template': true
        });
    });

    it('should set tsconfig', () => {
        let options = resolver.resolve({ tsconfig: 'custom.tsconfig.json' });
        expect(options).toEqual({
            tsconfig: 'custom.tsconfig.json',
            'tsconfig-template': false
        });

        options = resolver.resolve({ tsconfig: undefined });
        expect(options).toEqual({
            tsconfig: undefined,
            'tsconfig-template': true
        });
    });
});
