import { BuildOptions } from '../../types';
import path from 'path';
import fs from 'fs';

export class Cleaner {
    static cleanDist(options: Partial<BuildOptions>) {
        const distPath = path.dirname(options.output as string);
        if (!fs.existsSync(distPath)) {
            console.warn(`${distPath} does not exist. Skiping dist clean`);
            return;
        }
    }
}
