import {
    buildOptions,
    typescriptOptions,
    processorOptions,
    preprocessorOptions,
    postprocessorOptions,
    configOptions,
    adobeOptions
} from './optionsMap';

export const KTBuilderOptions = [
    ...buildOptions,
    ...typescriptOptions,
    ...processorOptions,
    ...preprocessorOptions,
    ...postprocessorOptions,
    ...configOptions,
    ...adobeOptions
] as const;

export type KTBuilderOption = (typeof KTBuilderOptions)[number];
