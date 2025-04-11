import ts from 'typescript';
import { DependencyRule } from '../../../types';
import { BuildOptions } from '../../../types';

const modeRule: DependencyRule = (options: Partial<BuildOptions>): Partial<BuildOptions> => {
    if (options.mode === 'production') {
        return {
            ...options,
            watch: false
            // test: false
        };
    } else if (options.mode === 'development') {
        return {
            ...options,
            watch: true
        };
    }
    return options;
};

const testRule: DependencyRule = (options: Partial<BuildOptions>): Partial<BuildOptions> => {
    if (options.test) {
        const ruledOptions: Partial<BuildOptions> = {};
        if (options.test === true) {
            if (options['tsconfig-test-path'] === undefined) {
                ruledOptions['tsconfig-template'] = true;
            }
        }
        return {
            ...options,
            ...ruledOptions
        };
    }
    return options;
};

const tsconfigRule: DependencyRule = (options: Partial<BuildOptions>): Partial<BuildOptions> => {
    const tsconfigOption: Partial<BuildOptions> = {};
    if (!options.tsconfig && !options['tsconfig-test-path']) {
        tsconfigOption['tsconfig-template'] = true;
    } else {
        tsconfigOption['tsconfig-template'] = false;
    }
    return {
        ...options,
        ...tsconfigOption
    };
};

const cleanRule: DependencyRule = (options: Partial<BuildOptions>): Partial<BuildOptions> => {
    const cleanedOptions: Partial<BuildOptions> = {};
    if (!options.clean) {
        cleanedOptions.clean = ['false'];
    }
    if (!Array.isArray(cleanedOptions.clean) && typeof cleanedOptions.clean === 'string') {
        cleanedOptions.clean = [cleanedOptions.clean];
    }
    return {
        ...options,
        ...cleanedOptions
    };
};

export const baseOptionsRules = { modeRule, testRule, tsconfigRule };
