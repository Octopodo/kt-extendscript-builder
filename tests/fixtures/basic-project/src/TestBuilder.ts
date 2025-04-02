export class TestBuilder {
    private version: string;

    constructor(version: string) {
        this.version = version;
    }

    salute() {
        $.writeln('Hello from TestBuilder ' + this.version);
    }
}
