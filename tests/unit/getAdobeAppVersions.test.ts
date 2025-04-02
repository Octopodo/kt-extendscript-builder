import { describe, expect, it } from 'vitest';
import { getAdobeAppVersions } from '../../src/lib/utils/getAdobeAppVersions';

const afterEffectsVersions = [
    '10.5',
    '11.0',
    '12.0',
    '13.0',
    '13.1',
    '13.2',
    '13.6',
    '13.8',
    '14.0',
    '14.2',
    '15.0',
    '16.0',
    '16.1',
    '17.0',
    '17.1',
    '18.0',
    '22.0',
    '22.3',
    '22.6',
    '23.0',
    '8.0',
    '9.0'
];
const animateVersions = ['13.0', '22.0'];
const auditionVersions = ['2015.2', '2017', '2018'];
const illustratorVersions = ['2015.3', '2022'];
const inDesignVersions = ['2015.3', '2018', '2021'];
const photoshopVersions = ['2015.5'];
const premiereVersions = ['11.0', '12.0', '13.0', '14.0', '15.0'];

describe('getAdobeAppVersions', () => {
    it('should return all apps', () => {
        const versions = getAdobeAppVersions();
        const expectedApps = [
            'AfterEffects',
            'Animate',
            'Audition',
            'Illustrator',
            'InDesign',
            'Photoshop',
            'Premiere'
        ];
        expect(Object.keys(versions)).toEqual(expectedApps);
    });
    it('should return versions for After Effects', () => {
        const versions = getAdobeAppVersions();
        expect(versions.AfterEffects).toEqual(afterEffectsVersions);
    });
    it('should return versions for Animate', () => {
        const versions = getAdobeAppVersions();
        expect(versions.Animate).toEqual(animateVersions);
    });
    it('should return versions for Audition', () => {
        const versions = getAdobeAppVersions();
        expect(versions.Audition).toEqual(auditionVersions);
    });
    it('should return versions for Illustrator', () => {
        const versions = getAdobeAppVersions();
        expect(versions.Illustrator).toEqual(illustratorVersions);
    });
    it('should return versions for InDesign', () => {
        const versions = getAdobeAppVersions();
        expect(versions.InDesign).toEqual(inDesignVersions);
    });
    it('should return versions for Photoshop', () => {
        const versions = getAdobeAppVersions();
        expect(versions.Photoshop).toEqual(photoshopVersions);
    });
    it('should return versions for Premiere', () => {
        const versions = getAdobeAppVersions();
        expect(versions.Premiere).toEqual(premiereVersions);
    });
});
