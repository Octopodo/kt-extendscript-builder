import { BuildOptions } from '../../types';
import { OptionsResolver, OptionsParser } from '../options';
import { createViteConfig } from '../config/createViteConfig';
import { createRollupConfig } from '../config/createRollupConfig';
import { ExtendedViteConfig } from '../../types';
import { defineConfig, build as viteBuild } from 'vite';

export class Builder {
    private options: Partial<BuildOptions> = {};
    private viteConfig: ExtendedViteConfig = {} as ExtendedViteConfig;

    async run(): Promise<void> {
        this.preprocess();

        await viteBuild(this.viteConfig);
        if (this.options.watch) {
            return this.watch();
        } else {
            return this.build();
        }
    }

    preprocess() {
        const options = OptionsParser.parse();
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
