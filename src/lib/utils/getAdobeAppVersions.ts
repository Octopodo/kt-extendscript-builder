import * as fs from 'fs';
import * as path from 'path';

interface AdobeAppVersions {
    [appName: string]: string[];
}

export function getAdobeAppVersions(): AdobeAppVersions {
    const typesForAdobePath = path.join(process.cwd(), 'node_modules', 'Types-for-Adobe');
    if (!fs.existsSync(typesForAdobePath)) {
        throw new Error('No se encontró el directorio node_modules/Types-for-Adobe.');
    }

    const appFolders = fs
        .readdirSync(typesForAdobePath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    const adobeApps = ['AfterEffects', 'Animate', 'Audition', 'Illustrator', 'InDesign', 'Photoshop', 'Premiere'];

    const apps = appFolders.filter((app) => adobeApps.includes(app));
    const appVersions: AdobeAppVersions = {};

    for (const app of apps) {
        const appPath = path.join(typesForAdobePath, app);
        const versionFolders = fs
            .readdirSync(appPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        appVersions[app] = versionFolders.sort();
    }

    return appVersions;
}
