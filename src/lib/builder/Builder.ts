import { BuildOptions } from '../../types';
import { OptionsResolver, OptionsParser } from '../options';
import { createViteConfig } from './createViteConfig';
import { createRollupConfig } from './createRollupConfig';
import { ExtendedViteConfig } from '../../types';
import { defineConfig, build as viteBuild } from 'vite';

export class Builder {
    private options: Partial<BuildOptions> = {};
    private viteConfig: ExtendedViteConfig = {} as ExtendedViteConfig;

    async run(): Promise<void> {
        this.preprocess();
        this.build();
        await viteBuild(this.viteConfig);
        if (this.options.watch) {
            return this.watch();
        } else {
            return this.build();
        }
    }

    preprocess() {
        const parser = new OptionsParser();
        const options = parser.parse();
        const redolver = new OptionsResolver();
        this.options = redolver.resolve(options, {});

        const viteConfig = createViteConfig(this.options);
        viteConfig.extendScriptConfig = createRollupConfig(this.options);

        this.viteConfig = defineConfig(viteConfig);
    }

    build() {
        return this.viteConfig.extendScriptConfig.build();
    }

    watch() {
        return this.viteConfig.extendScriptConfig.watch();
    }
}
