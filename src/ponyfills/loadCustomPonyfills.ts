import fs from 'fs';
import path from 'path';
import { basePonyfills } from './basePonyfills';

export interface PonyfillItem {
  find: string;
  replace: string;
  inject: string;
}

/**
 * Loads custom ponyfills from a file and combines them with base ponyfills
 * @param customPonyfillsPath Path to the custom ponyfills file
 * @returns Combined list of base and custom ponyfills
 */
export function loadCustomPonyfills(
  customPonyfillsPath?: string
): PonyfillItem[] {
  // Start with base ponyfills
  let allPonyfills = [...basePonyfills];

  // If no path specified, return base ponyfills
  if (!customPonyfillsPath) {
    return allPonyfills;
  }

  // Resolve absolute path
  const absolutePath = path.isAbsolute(customPonyfillsPath)
    ? customPonyfillsPath
    : path.resolve(process.cwd(), customPonyfillsPath);

  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
    console.warn(`Custom ponyfills file does not exist: ${absolutePath}`);
    return allPonyfills;
  }

  try {
    // Load the file
    const requiredModule = require(absolutePath);
    let customPonyfills: PonyfillItem[] = [];

    // Support multiple export formats
    if (Array.isArray(requiredModule)) {
      // Format: module.exports = []
      customPonyfills = requiredModule;
    } else if (
      requiredModule.default &&
      Array.isArray(requiredModule.default)
    ) {
      // Format: export default []
      customPonyfills = requiredModule.default;
    } else if (
      requiredModule.ponyfills &&
      Array.isArray(requiredModule.ponyfills)
    ) {
      // Format: export const ponyfills = []
      customPonyfills = requiredModule.ponyfills;
    } else if (
      requiredModule.myPonyfills &&
      Array.isArray(requiredModule.myPonyfills)
    ) {
      // Format: export const myPonyfills = []
      customPonyfills = requiredModule.myPonyfills;
    } else {
      // Look for any property that's an array
      const arrayProps = Object.keys(requiredModule).filter((key) =>
        Array.isArray(requiredModule[key])
      );

      if (arrayProps.length > 0) {
        // Use the first array found
        customPonyfills = requiredModule[arrayProps[0]];
        console.log(
          `Using the "${arrayProps[0]}" export from the ponyfills file`
        );
      } else {
        throw new Error('No valid ponyfills export found (must be an array)');
      }
    }

    // Validate that ponyfills have the correct format
    const validPonyfills = customPonyfills.filter((ponyfill) => {
      const isValid = ponyfill.find && ponyfill.replace && ponyfill.inject;
      if (!isValid) {
        console.warn(
          'Invalid ponyfill found, must have properties: find, replace, inject'
        );
      }
      return isValid;
    });

    console.log(
      `Loaded ${validPonyfills.length} custom ponyfills from: ${customPonyfillsPath}`
    );

    // Combine ponyfills
    return [...allPonyfills, ...validPonyfills];
  } catch (error) {
    console.error(`Error loading custom ponyfills: ${error}`);
    return allPonyfills;
  }
}
