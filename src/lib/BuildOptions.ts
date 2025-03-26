// Structure of the kt-config.json file
export interface KTConfig {
  default?: BuildOptions; // Default configuration
  [configName: string]: BuildOptions | undefined; // Named configurations
}

// BuildOptions includes the optional tsconfig field
export interface BuildOptions {
  input: string;
  output: string;
  tsconfig?: string;
  mode: 'production' | 'development';
  watch: boolean;
  clean: boolean;
  useTemplateTsconfig?: boolean;
  customPonyfills?: string;
  destApp?: string;
  appVersion?: string;
  test?: boolean;
}
