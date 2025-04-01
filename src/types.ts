import { KTBuilderOptions, KTBuilderOption } from './lib/options/KTBuilderOptions';

export interface PonyfillItem {
    find: string;
    replace: string;
    inject: string;
}

// src/config/build-options.ts

// Mapear tipos de opciones a tipos de TypeScript
type OptionTypeToTsType<T extends KTBuilderOption['type'], D = undefined> = T extends 'string'
    ? string
    : T extends 'boolean'
    ? boolean
    : T extends 'array'
    ? string[]
    : never;

// Generar la interfaz BuildOptions con un enfoque más seguro
export type BuildOptions = {
    [K in KTBuilderOption['name']]: Extract<KTBuilderOption, { name: K }> extends infer O
        ? O extends { type: infer T; default: infer D }
            ? T extends KTBuilderOption['type']
                ? OptionTypeToTsType<T>
                : never
            : O extends { type: infer T }
            ? T extends KTBuilderOption['type']
                ? OptionTypeToTsType<T> | undefined
                : never
            : never
        : never;
};

// Exportar valores predeterminados con tipado correcto
export const defaultBuildOptions: Partial<BuildOptions> = Object.fromEntries(
    KTBuilderOptions.filter((opt): opt is Extract<KTBuilderOption, { default: any }> => 'default' in opt).map((opt) => [
        opt.name,
        opt.default
    ])
);

export type DependencyRule = (options: Partial<BuildOptions>) => Partial<BuildOptions>;
