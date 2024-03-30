import { CrispOquentConfig } from './crisp-oquent-config';

export class CrispOquent {
    constructor() {}

    public static initialize(
        object: {
            baseUri: string
        }
    ): void {
        CrispOquentConfig.options.baseUri = object.baseUri
    }

}
