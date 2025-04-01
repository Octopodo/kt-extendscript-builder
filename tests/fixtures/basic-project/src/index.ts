class TestBulder {
    private version: string;

    constructor(version: string) {
        this.version = version;
    }

    salute() {
        $.writeln('Hello from TestBuilder ' + this.version);
    }
}

const testBuilder = new TestBulder('1.0.0');
testBuilder.salute();
