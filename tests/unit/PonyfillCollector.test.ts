import { describe, it, expect } from 'vitest';
import { PonyfillCollector } from '../../src/lib/utils/PonifillCollector';
import { basePonyfills } from '../../src/lib/ponyfills/basePonyfills';

describe('PonyfillCollector', () => {
    it('should collect ponifills from file', () => {
        const collector = new PonyfillCollector();
        const userPonyfillsPaths = ['src/lib/ponyfills/basePonyfills.ts'];
        const collectedPonyfills = collector.collect(userPonyfillsPaths);
        expect(collectedPonyfills).toBeDefined();
        expect(collectedPonyfills).toEqual(basePonyfills);
    }); // Replace with actual checks
});
