import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { build } from 'vite';
import { createViteConfig } from '../config/vite.config';
import { tsconfigES3, tsconfigTestsES3 } from '../tsconfigs/templates';
//@ts-ignore
import rimraf from 'rimraf';
import { promisify } from 'util';
import * as ts from 'typescript';
import { BuildOptions } from './BuildOptions';
const rimrafAsync = promisify(rimraf);

export async function buildExtendScript(options: BuildOptions): Promise<void> {
  const {
    input,
    output,
    tsconfig,
    mode,
    watch: watchMode,
    clean,
    useTemplateTsconfig = false,
    customPonyfills,
    destApp,
    appVersion
  } = options;

  const outDir = path.dirname(output);

  // Limpiar directorio si es necesario
  if (clean) {
    console.log(`Limpiando directorio: ${outDir}`);
    await rimrafAsync(`${outDir}/*`);
  }

  // Compilar TypeScript usando archivo temporal o existente
  if (useTemplateTsconfig || !tsconfig) {
    // Determinar si estamos en modo test
    const isTestMode = outDir.includes('test');
    const templateConfig = isTestMode ? tsconfigTestsES3 : tsconfigES3;
    const templateName = isTestMode
      ? 'tsconfig.tests.es3.json'
      : 'tsconfig.es3.json';

    if (destApp && appVersion) {
      // Modificar configuración para incluir app y versión
      templateConfig.compilerOptions.types.push(
        `types-for-adobe/${destApp}/${appVersion}`
      );
    }

    console.log('Compilando TypeScript usando configuración de plantilla');

    // Crear archivo temporal con el contenido
    const tempConfigPath = path.join(process.cwd(), templateName);

    // Modificamos la configuración para asegurarnos que rootDir apunte a la raíz del proyecto
    const configToWrite = {
      ...templateConfig,
      compilerOptions: {
        ...templateConfig.compilerOptions,
        outDir,
        // No establecemos rootDir, dejamos que TypeScript lo infiera
        rootDir: undefined
      }
    };

    fs.writeFileSync(tempConfigPath, JSON.stringify(configToWrite, null, 2));
    console.log(`Creado archivo de configuración temporal: ${templateName}`);

    try {
      // Compilar usando el archivo temporal
      execSync(`tsc -p "${tempConfigPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error compilando TypeScript:', error);
      throw error; // Propagar el error para que se maneje arriba
    } finally {
      // Eliminar archivo temporal de manera más tolerante
      try {
        if (fs.existsSync(tempConfigPath)) {
          fs.unlinkSync(tempConfigPath);
          console.log(
            `Eliminado archivo de configuración temporal: ${templateName}`
          );
        }
      } catch (err) {
        // Solo loguear el error, no es crítico si el archivo no se puede eliminar
        console.warn(
          `No se pudo eliminar el archivo temporal ${templateName}:`,
          err
        );
      }
    }
  } else {
    // Usar configuración de archivo existente
    console.log(`Compilando TypeScript usando ${tsconfig}`);
    execSync(`tsc -p "${tsconfig}"`, { stdio: 'inherit' });
  }

  // Configurar y ejecutar Vite
  console.log(`Iniciando build con Vite: ${input} -> ${output}`);
  try {
    // Prepara las variables de entorno que Vite necesita
    process.env.VITE_INPUT = input;
    process.env.VITE_OUT_PATH = outDir;

    // Crear configuración de Vite
    const viteConfig = createViteConfig({
      input,
      outDir,
      watch: watchMode,
      mode,
      customPonyfills
    });

    console.log('Configuración Vite:', {
      input,
      outDir,
      outPathExtendscript: output,
      extensions: viteConfig.build?.rollupOptions?.external,
      mode
    });

    // Ejecutar build de Vite
    await build({
      ...viteConfig,
      configFile: false
    });

    console.log('Build completada exitosamente');
  } catch (error) {
    console.error('Error en build Vite:', error);
    throw error;
  }
}
