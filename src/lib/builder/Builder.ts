import { BuildOptions } from '../../types';
import { OptionsResolver } from '../options';
import { createViteConfig } from '../config/createViteConfig';
import { createRollupConfig } from '../config/createRollupConfig';
import { ExtendedViteConfig } from '../../types';
import { defineConfig } from 'vite';
import { Cleaner } from './Cleaner';
import { OptionsParser } from '../options/OptionsParser';
/**
 * Clase principal del sistema de construcción.
 * Coordina el proceso de construcción con una estructura simple y clara.
 */
export class Builder {
    private options: Partial<BuildOptions> = {};
    private viteConfig: ExtendedViteConfig = {} as ExtendedViteConfig;
    private optionsResolver: OptionsResolver;

    constructor() {
        this.optionsResolver = new OptionsResolver();
    }

    /**
     * Ejecuta el proceso de construcción con las opciones configuradas
     * Este método ejecuta el proceso completo de limpieza-construcción-limpieza
     */
    async build(command?: string): Promise<void> {
        // Si no se han configurado opciones, lo hacemos automáticamente
        if (Object.keys(this.options).length === 0) {
            this.options = this.optionsResolver.resolve(command);
        }

        try {
            // 1. Limpieza inicial si es necesario
            await this.cleanIfNeeded('before');

            // 2. Construir solo si no es un comando de limpieza exclusivo
            const isCleanOnly = process.argv.includes('clean-only');
            if (!isCleanOnly) {
                // Configurar Vite y Rollup
                const viteConfig = createViteConfig(this.options);
                viteConfig.extendScriptConfig = createRollupConfig(this.options);
                this.viteConfig = defineConfig(viteConfig);

                // Ejecutar build o watch según la configuración
                if (this.options.watch) {
                    await this.viteConfig.extendScriptConfig.watch();
                } else {
                    await this.viteConfig.extendScriptConfig.build();
                }
            }

            // 3. Limpieza final si es necesario
            await this.cleanIfNeeded('after');
        } catch (error) {
            console.error('Error durante el proceso de construcción:', error);
            throw error;
        }
    }

    /**
     * Método de conveniencia que combina configuración y construcción
     * Para mantener compatibilidad con código existente
     */
    async run(): Promise<void> {
        const commands = OptionsParser.extractCommands();
        if (commands.length === 0) {
            await this.build();
        }
        for (const command of commands) {
            await this.build(command);
        }
    }

    /**
     * Determina si se debe limpiar el directorio según las opciones
     */
    private shouldClean(stage: 'before' | 'after'): boolean {
        if (!this.options.clean) return false;

        // Si es un string, convertir a array para procesamiento uniforme
        const cleanOption =
            typeof this.options.clean === 'string'
                ? [this.options.clean]
                : Array.isArray(this.options.clean)
                ? this.options.clean
                : [];

        // Si se especificó 'false', no limpiar nada
        if (cleanOption.includes('false')) return false;

        // Limpiar si se especificó 'both' o la etapa específica
        return cleanOption.includes('both') || cleanOption.includes(stage);
    }

    /**
     * Limpia el directorio de salida si es necesario según la configuración
     */
    private async cleanIfNeeded(stage: 'before' | 'after'): Promise<void> {
        if (this.shouldClean(stage)) {
            console.log(`Iniciando limpieza (${stage})...`);
            await Cleaner.cleanDist(this.options);
        }
    }
}
