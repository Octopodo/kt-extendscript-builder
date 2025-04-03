import { KT } from 'kt-core';

export class TestBuilder {
    private version: string;

    constructor(version: string) {
        this.version = version;
        JSON.stringify({});
        const kt = new KT();
    }

    salute() {
        $.writeln('Hello from TestBuilder ' + this.version);
    }
}
