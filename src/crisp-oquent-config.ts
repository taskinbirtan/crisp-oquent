export interface CrispOquentOptions {
    baseUri: string;
    // TODO extend this interface with other general settings
}

export class CrispOquentConfig {
    private static _options: CrispOquentOptions = {
        baseUri: 'https://foo.fighters.ftw/api',

    };

    static get options(): CrispOquentOptions {
        return this._options;
    }

    static set options(options: CrispOquentOptions) {
        this._options = options;
    }
}
