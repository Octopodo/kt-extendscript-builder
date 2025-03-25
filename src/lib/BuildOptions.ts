// Estructura del archivo kt-config.json
export interface KTConfig {
  default?: BuildOptions; // Configuración por defecto
  [configName: string]: BuildOptions | undefined; // Configuraciones con nombre
}

// BuildOptions incluye el campo tsconfig opcional
export interface BuildOptions {
  input: string;
  output: string;
  tsconfig?: string;
  mode: 'production' | 'development';
  watch: boolean;
  clean: boolean;
  useTemplateTsconfig?: boolean;
  customPonyfills?: string;
}
