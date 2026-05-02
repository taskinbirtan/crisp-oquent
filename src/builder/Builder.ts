import type { Model, ModelConstructor } from '../Model.js';
import { request } from '../http-client.js';
import { buildQueryString, type QueryParams, type QueryValue } from '../query-string.js';
import {
  PaginatedResults,
  parsePaginated,
  type RawLaravelPaginated,
} from '../pagination/PaginatedResults.js';

export type SortDirection = 'asc' | 'desc';

export class Builder<T extends Model> {
  private readonly modelClass: ModelConstructor<T>;
  private readonly params: QueryParams = {
    filter: {},
    sort: [],
    include: [],
    fields: {},
    append: [],
    extra: {},
  };

  constructor(modelClass: ModelConstructor<T>) {
    this.modelClass = modelClass;
  }

  filter(name: string, value: QueryValue | QueryValue[]): this {
    this.params.filter![name] = value;
    return this;
  }

  /**
   * Spatie filter groups (laravel-query-builder #1060): server-side
   * AllowedFilter::groupOr / groupAnd shorthand. Client just sends
   * filter[shorthand]=value; the OR/AND composition lives on the server.
   */
  filterGroup(shorthand: string, value: QueryValue | QueryValue[]): this {
    return this.filter(shorthand, value);
  }

  sortBy(field: string, direction: SortDirection = 'asc'): this {
    const token = direction === 'desc' ? `-${field}` : field;
    this.params.sort!.push(token);
    return this;
  }

  sortByDesc(field: string): this {
    return this.sortBy(field, 'desc');
  }

  include(...relations: string[]): this {
    for (const rel of relations) {
      if (!this.params.include!.includes(rel)) this.params.include!.push(rel);
    }
    return this;
  }

  includeCount(...relations: string[]): this {
    return this.include(...relations.map((r) => (r.endsWith('Count') ? r : `${r}Count`)));
  }

  includeExists(...relations: string[]): this {
    return this.include(...relations.map((r) => (r.endsWith('Exists') ? r : `${r}Exists`)));
  }

  fields(type: string, ...names: string[]): this {
    const existing = this.params.fields![type] ?? [];
    this.params.fields![type] = [...existing, ...names];
    return this;
  }

  append(...names: string[]): this {
    for (const name of names) {
      if (!this.params.append!.includes(name)) this.params.append!.push(name);
    }
    return this;
  }

  param(name: string, value: QueryValue | QueryValue[]): this {
    this.params.extra![name] = value;
    return this;
  }

  page(page: number): this {
    this.params.page = page;
    return this;
  }

  perPage(perPage: number): this {
    this.params.perPage = perPage;
    return this;
  }

  private buildPath(suffix = ''): string {
    return this.modelClass.uri + suffix + buildQueryString(this.params);
  }

  async get(): Promise<T[]> {
    const response = await request<{ data: Array<Record<string, unknown>> }>(this.buildPath());
    return (response.data ?? []).map((item) => new this.modelClass(item));
  }

  async first(): Promise<T | null> {
    this.perPage(1).page(1);
    const items = await this.get();
    return items[0] ?? null;
  }

  async find(id: string | number): Promise<T | null> {
    try {
      const response = await request<{ data: Record<string, unknown> }>(
        this.buildPath(`/${id}`),
      );
      return new this.modelClass(response.data);
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 404) return null;
      throw error;
    }
  }

  async paginate(page = 1, perPage = 15): Promise<PaginatedResults<T>> {
    this.page(page).perPage(perPage);
    const raw = await request<RawLaravelPaginated>(this.buildPath());
    return parsePaginated(raw, this.modelClass);
  }

  async all(maxPages = 100): Promise<T[]> {
    const collected: T[] = [];
    let current = 1;
    while (current <= maxPages) {
      const page = await this.paginate(current, this.params.perPage ?? 100);
      collected.push(...page.items);
      if (!page.hasMorePages()) break;
      current += 1;
    }
    return collected;
  }

  async create(payload: Record<string, unknown>): Promise<T> {
    const response = await request<{ data: Record<string, unknown> }>(this.modelClass.uri, {
      method: 'POST',
      body: payload,
    });
    return new this.modelClass(response.data);
  }
}
