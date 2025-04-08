// import { execSync } from 'child_process';
// import path from 'path';
// import fs from 'fs';
// import { build } from 'vite';
// import { createViteConfig } from '../config/vite.config';
// import { tsconfigES3, tsconfigTestsES3 } from './config/tsconfigTemplates';
// //@ts-ignore
// import rimraf from 'rimraf';
// import { promisify } from 'util';
// import * as ts from 'typescript';
// import { BuildOptions } from '../types';
// const rimrafAsync = promisify(rimraf);

// export async function buildExtendScript(options: BuildOptions): Promise<void> {
//     const {
//         input,
//         output,
//         tsconfig,
//         mode,
//         watch: watchMode,
//         clean,
//         useTemplateTsconfig = false,
//         customPonyfills,
//         destApp,
//         appVersion
//     } = options;

//     const outDir = path.dirname(output);

//     // Clean directory if needed
//     if (clean) {
//         console.log(`Cleaning directory: ${outDir}`);
//         await rimrafAsync(`${outDir}/*`);
//     }

//     // Compile TypeScript using a temporary file or existing one
//     if (useTemplateTsconfig || !tsconfig) {
//         // Determine if we are in test mode
//         const isTestMode = options.test === true;
//         const templateConfig = isTestMode ? tsconfigTestsES3 : tsconfigES3;
//         const templateName = isTestMode ? 'tsconfig.tests.es3.json' : 'tsconfig.es3.json';
//         if (destApp && appVersion) {
//             // Modify configuration to include app and version
//             templateConfig.compilerOptions.types.push(`types-for-adobe/${destApp}/${appVersion}`);
//         }

//         console.log('Compiling TypeScript using template configuration');

//         // Create temporary file with the content
//         const tempConfigPath = path.join(process.cwd(), templateName);

//         // Modify the configuration to ensure rootDir points to project root
//         const configToWrite = {
//             ...templateConfig,
//             compilerOptions: {
//                 ...templateConfig.compilerOptions,
//                 outDir,
//                 // Para tests, usar 'src' como rootDir
//                 rootDir: isTestMode ? './src' : path.dirname(input)
//             },
//             include: isTestMode
//                 ? ['src/tests/**/*.ts', 'src/**/*.ts'] // Para tests, incluir todos los archivos
//                 : [input], // Para compilación normal, solo el archivo de entrada
//             files: isTestMode ? undefined : [input]
//         };

//         const configCreated = fs.writeFileSync(tempConfigPath, JSON.stringify(configToWrite, null, 2));
//         console.log(`Created temporary configuration file: ${templateName}`);

//         try {
//             // Compile using the temporary file
//             execSync(`tsc -p "${tempConfigPath}"`, { stdio: 'inherit' });
//         } catch (error) {
//             console.error('Error compiling TypeScript:', error);
//             throw error; // Propagate error to be handled upstream
//         } finally {
//             // Remove temporary file in a more tolerant way
//             try {
//                 if (fs.existsSync(tempConfigPath)) {
//                     fs.unlinkSync(tempConfigPath);
//                     console.log(`Removed temporary configuration file: ${templateName}`);
//                 }
//             } catch (err) {
//                 // Just log the error, it's not critical if the file cannot be deleted
//                 console.warn(`Could not delete temporary file ${templateName}:`, err);
//             }
//         }
//     } else {
//         // Use existing configuration file
//         console.log(`Compiling TypeScript using ${tsconfig}`);
//         execSync(`tsc -p "${tsconfig}"`, { stdio: 'inherit' });
//     }

//     // Configure and run Vite
//     console.log(`Starting build with Vite: ${input} -> ${output}`);
//     try {
//         // Prepare environment variables needed by Vite
//         process.env.VITE_INPUT = input;
//         process.env.VITE_OUT_PATH = outDir;

//         // Create Vite configuration
//         const viteConfig = createViteConfig({
//             input,
//             outDir,
//             watch: watchMode,
//             mode,
//             customPonyfills
//         });

//         console.log('Vite Configuration:', {
//             input,
//             outDir,
//             outPathExtendscript: output,
//             extensions: viteConfig.build?.rollupOptions?.external,
//             mode
//         });

//         // Run Vite build
//         await build({
//             ...viteConfig,
//             configFile: false
//         });

//         // Explicitly run ExtendScript build
//         if ((viteConfig as any).extendScriptConfig) {
//             console.log('Running final ExtendScript process...');
//             if (watchMode) {
//                 await (viteConfig as any).extendScriptConfig.watch();
//             } else {
//                 await (viteConfig as any).extendScriptConfig.build();
//             }
//         }

//         console.log('Build completed successfully');
//     } catch (error) {
//         console.error('Error in Vite build:', error);
//         throw error;
//     }
// }
