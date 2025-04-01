import { get } from 'http';
import { DependencyRule } from '../../types';
import { BuildOptions } from '../../types';
import { getAdobeAppVersions } from '../../utils/getAdobeAppVersions';
const availableVersions = getAdobeAppVersions();

function adjustVersion(app: string, version: string): string {
    //Check if version exists for the app
    //if not, return the nearest lower version
    const versions = availableVersions[app];

    const versionIndex = versions.indexOf(version);
    if (versionIndex !== -1) {
        return version;
    }
    // Find the nearest lower version
    for (let i = versions.length - 1; i >= 0; i--) {
        if (versions[i] < version) {
            return versions[i];
        }
    }
    // If no lower version is found, return the last version
    return versions[versions.length - 1];
}

const appVersionRule: DependencyRule = (options: Partial<BuildOptions>): Partial<BuildOptions> => {
    const app = options['dest-app'];
    const version = options['app-version'];
    if (!app || !availableVersions[app]) {
        return options;
    }
    if (version && availableVersions[app].includes(version)) {
        return options;
    }
    if (version) {
        const adjustedVersion = adjustVersion(app, version);
        return {
            ...options,
            'app-version': adjustedVersion
        };
    }
    return {
        ...options
    };
};

export const adobeOptionsRules = { appVersionRule };
