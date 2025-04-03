import { describe, expect, it, runTests } from 'kt-testing-suite-core';
import { KT as _KT } from 'kt-core';
const KT = new _KT();
describe('Test buil', () => {
    it('should run the test', () => {
        const num = 1;
        const str = 'my string';

        expect(num).toBe(1);
        expect(num).toBeNumber();
        expect(str).toBe('my string');
        expect(str).not().toBe('other string');
        expect(str).toContain('my');
        expect(str).not().toContain('other');
    });
});

runTests();
