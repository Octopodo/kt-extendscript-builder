import fs from 'fs';
import path from 'path';
import { basePonyfills } from './basePonyfills';

export interface PonyfillItem {
  find: string;
  replace: string;
  inject: string;
}

/**
 * Carga ponyfills personalizados desde un archivo y los combina con los ponyfills base
 * @param customPonyfillsPath Ruta al archivo de ponyfills personalizados
 * @returns Lista combinada de ponyfills base y personalizados
 */
export function loadCustomPonyfills(
  customPonyfillsPath?: string
): PonyfillItem[] {
  // Comenzar con los ponyfills base
  let allPonyfills = [...basePonyfills];

  // Si no se especificó ruta, devolver los ponyfills base
  if (!customPonyfillsPath) {
    return allPonyfills;
  }

  // Resolver la ruta absoluta
  const absolutePath = path.isAbsolute(customPonyfillsPath)
    ? customPonyfillsPath
    : path.resolve(process.cwd(), customPonyfillsPath);

  // Verificar si el archivo existe
  if (!fs.existsSync(absolutePath)) {
    console.warn(
      `El archivo de ponyfills personalizado no existe: ${absolutePath}`
    );
    return allPonyfills;
  }

  try {
    // Cargar el archivo
    const requiredModule = require(absolutePath);
    let customPonyfills: PonyfillItem[] = [];

    // Soportar múltiples formatos de exportación
    if (Array.isArray(requiredModule)) {
      // Formato: module.exports = []
      customPonyfills = requiredModule;
    } else if (
      requiredModule.default &&
      Array.isArray(requiredModule.default)
    ) {
      // Formato: export default []
      customPonyfills = requiredModule.default;
    } else if (
      requiredModule.ponyfills &&
      Array.isArray(requiredModule.ponyfills)
    ) {
      // Formato: export const ponyfills = []
      customPonyfills = requiredModule.ponyfills;
    } else if (
      requiredModule.myPonyfills &&
      Array.isArray(requiredModule.myPonyfills)
    ) {
      // Formato: export const myPonyfills = []
      customPonyfills = requiredModule.myPonyfills;
    } else {
      // Buscar cualquier propiedad que sea un array
      const arrayProps = Object.keys(requiredModule).filter((key) =>
        Array.isArray(requiredModule[key])
      );

      if (arrayProps.length > 0) {
        // Usar el primer array encontrado
        customPonyfills = requiredModule[arrayProps[0]];
        console.log(
          `Usando la exportación "${arrayProps[0]}" del archivo de ponyfills`
        );
      } else {
        throw new Error(
          'No se encontró una exportación válida de ponyfills (debe ser un array)'
        );
      }
    }

    // Validar que los ponyfills tengan el formato correcto
    const validPonyfills = customPonyfills.filter((ponyfill) => {
      const isValid = ponyfill.find && ponyfill.replace && ponyfill.inject;
      if (!isValid) {
        console.warn(
          'Ponyfill inválido encontrado, debe tener propiedades: find, replace, inject'
        );
      }
      return isValid;
    });

    console.log(
      `Cargados ${validPonyfills.length} ponyfills personalizados desde: ${customPonyfillsPath}`
    );

    // Combinar ponyfills
    return [...allPonyfills, ...validPonyfills];
  } catch (error) {
    console.error(`Error al cargar ponyfills personalizados: ${error}`);
    return allPonyfills;
  }
}
