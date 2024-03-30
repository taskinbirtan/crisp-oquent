import {Model, PaginatedResults, parseResults} from "../";
import {CrispOquentConfig} from "../crisp-oquent-config";

export class Builder<T extends Model> {
    private model: T;
    private readonly params: Record<string, string> = {};

    private currentPage: number = 1;
    private pageSize: number = 10;

    constructor(model: any) {
        this.model = model;

    }

    where(field: string, operator: string, value: any): this {
        this.params[`filter[${field}]`] = `${operator}${value}`;
        return this;
    }

    orderBy(field: string, direction: 'asc' | 'desc'): this {
        let prefix = '';
        if (direction === 'desc') {//TODO eksikleri tamamlayalim
            prefix = '-'
        }
        this.params['sort'] = `${prefix}${field}`;
        return this;
    }

    async paginate(page: number, pageSize: number): Promise<PaginatedResults<T>> {
        this.params['page'] = `${this.currentPage}`;
        this.params['per_page'] = `${this.pageSize}`;

        try {
            const response = await fetch(this.buildQueryString(), {
                method: "GET",
                headers: {"Content-Type": "application/json"},
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return parseResults<T>(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    private getUrl(): string {
        return CrispOquentConfig.options.baseUri + '/' + this.model.uri;
    }


    private buildQueryString(): string {
        const parts: string[] = [];
        for (const [key, value] of Object.entries(this.params)) {
            parts.push(`${key}=${value}`);
        }
        return this.getUrl() + '?' + parts.join('&');
    }
}
