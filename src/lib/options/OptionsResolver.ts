import { BuildOptions, defaultBuildOptions } from '../../types';
import { OptionsRuleResolver } from './OptionsRuleResolver';
import { ConfigLoader } from '../config/ConfigLoader';
import { OptionsParser } from './OptionsParser';

/**
 * Centraliza la gestión y resolución de opciones combinando todas las fuentes posibles.
 *
 * OptionsResolver determina la configuración final basada en:
 * - Opciones por defecto
 * - Presets (si se especifican)
 * - Opciones de archivo de configuración
 * - Opciones de línea de comandos
 * - Opciones de comandos específicos
 */
export class OptionsResolver {
    private rulesResolver: OptionsRuleResolver;
    private configLoader: ConfigLoader;

    constructor() {
        this.rulesResolver = new OptionsRuleResolver();
        this.configLoader = new ConfigLoader();
    }

    /**
     * Resuelve y combina todas las opciones de todas las fuentes posibles
     *
     * @param cliOptions - Opciones pasadas por línea de comandos (opcional)
     * @returns Opciones finales combinadas con todas las reglas aplicadas
     */
    resolve(command?: string): Partial<BuildOptions> {
        // Si no se proporcionan opciones CLI, obtenerlas del parser
        const options = OptionsParser.parse();

        // 1. Cargar configuraciones del archivo de configuración
        const configPath = options['config-file'] as string;

        this.configLoader.load(configPath);

        // 2. Inicializar procesador de comandos

        // 3. Cargar configuración de presets

        // 4. Extraer comandos de los argumentos

        // 5. Procesar opciones de comandos (si existen)
        let commandOptions = {};

        // 6. Determinar qué preset usar
        const presetName = options.preset || 'default';

        // 7. Resolver presets
        const userPreset = this.configLoader.getConfig(command) || {};
        const defaultPreset = this.configLoader.getConfig('default') || {};

        // 8. Empezar con las opciones base
        let mergedOptions = { ...defaultBuildOptions, ...defaultPreset };

        // 9. Determinar prioridad para la combinación
        const priority = ((options.priority || 'cli') as string).toLowerCase();

        // 10. Combinar todas las opciones según la prioridad
        if (priority === 'cli') {
            // CLI tiene prioridad más alta
            mergedOptions = {
                ...mergedOptions,
                ...userPreset,
                ...commandOptions,
                ...options
            };
        } else {
            // El preset o comandos tienen prioridad más alta
            mergedOptions = {
                ...mergedOptions,
                ...options,
                ...commandOptions,
                ...userPreset
            };
        }

        // 11. Aplicar reglas de transformación
        return this.rulesResolver.resolve(mergedOptions);
    }
}
