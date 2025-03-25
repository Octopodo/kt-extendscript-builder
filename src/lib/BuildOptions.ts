// Estructura del archivo kt-config.json
interface KTConfig {
  default?: BuildOptions; // Configuración por defecto
  [configName: string]: BuildOptions | undefined; // Configuraciones con nombre
}

// BuildOptions incluye el campo tsconfig opcional
interface BuildOptions {
  input?: string;
  output?: string;
  tsconfig?: string; // Ruta a un archivo tsconfig personalizado
  mode?: 'production' | 'development';
  watch?: boolean;
  clean?: boolean;
  useTemplateTsconfig?: boolean;
}
