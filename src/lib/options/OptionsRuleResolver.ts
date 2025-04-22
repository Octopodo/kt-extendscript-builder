import { BuildOptions, DependencyRule } from '../../types';
import { baseOptionsRules, adobeOptionsRules } from './rules';

/**
 * A resolver class for managing and applying option dependency rules to build options.
 *
 * This class allows for registering one or multiple options dependency rules and
 * resolving them against a set of build options. Each rule is a function that
 * can modify the build options.
 */
export class OptionsRuleResolver {
    /**
     * The collection of dependency rules to apply.
     * @private
     */
    private rules: DependencyRule[] = [];

    constructor() {
        // Initialize with base options rules
        this.addRules({ ...baseOptionsRules, ...adobeOptionsRules });
    }
    /**
     * Adds one or more dependency rules to the resolver.
     *
     * @param rule - A single dependency rule or an array of rules to add
     */
    addRules(rule: DependencyRule | DependencyRule[] | Record<string, DependencyRule>): void {
        if (Array.isArray(rule)) {
            // Case 1: If rule is an array of DependencyRule
            this.rules.push(...rule);
        } else if (typeof rule === 'function') {
            this.rules.push(rule);
        } else if (typeof rule === 'object') {
            const rulesArray = Object.values(rule);
            this.rules.push(...rulesArray);
        }
    }

    /**
     * Applies all registered dependency rules to the provided build options.
     *
     * @param options - The initial build options to transform
     * @returns The transformed build options after applying all rules
     */

    resolve(options: Partial<BuildOptions>): Partial<BuildOptions> {
        return this.rules.reduce((acc, rule) => rule(acc), options);
    }
}
