import {Builder} from './builder/Builder';

export abstract class Model {

    public uri: string = '';
    protected constructor(protected readonly data: any) {

    }

    public static crispy(): Builder<this> {
        return new Builder(this);
    }
}
