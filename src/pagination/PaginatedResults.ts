import {Model} from "../Model";

interface IPaginateMeta<T> {
    items: T[];
    total: number;
    currentPage: number;
    perPage: number;
    links: {
        first: string;
        last: string;
        prev: string;
    };
}

class PaginatedResults<T> {
    constructor(private data: IPaginateMeta<T>) {
    }

    get items(): T[] {
        return this.data.items;
    }

    get total(): number {
        return this.data.total;
    }

    get currentPage(): number {
        return this.data.currentPage;
    }

    get links(): {
        first: string;
        last: string;
        prev: string;
    } {
        return this.data.links;
    }

    get perPage(): number {
        return this.data.perPage;
    }
}

function parseResults<T extends Model>(data: any): { pagination: IPaginateMeta<T>; data: T[] } {
    const parsedData: T[] = data.data.data.map((item: any) => new Model(item));

    const meta = data.data;
    const paginationInfo: IPaginateMeta<any> = {
        total: meta.total,
        links: meta.links,
        currentPage: meta.current_page,
        perPage: meta.per_page,
        items: parsedData,
    };

    return {
        data: parsedData,
        pagination: paginationInfo
    };
}

export {PaginatedResults, parseResults};
