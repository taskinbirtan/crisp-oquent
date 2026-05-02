import { Builder } from './builder/Builder.js';
import { request } from './http-client.js';

export type ModelConstructor<T extends Model = Model> = (new (attributes: Record<string, unknown>) => T) & {
  uri: string;
  primaryKey: string;
};

const ATTR = Symbol('crisp.attributes');
const RESERVED = new Set([
  'constructor',
  'attributes',
  'getKey',
  'isPersisted',
  'fill',
  'toJSON',
  'save',
  'delete',
  ATTR.toString(),
]);

export abstract class Model {
  static uri: string = '';
  static primaryKey: string = 'id';

  private [ATTR]: Record<string, unknown>;

  constructor(attributes: Record<string, unknown> = {}) {
    this[ATTR] = { ...attributes };

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop === 'symbol' || RESERVED.has(prop) || prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        return target[ATTR][prop];
      },
      set: (target, prop, value, receiver) => {
        if (typeof prop === 'symbol' || RESERVED.has(prop) || prop in target) {
          return Reflect.set(target, prop, value, receiver);
        }
        target[ATTR][prop] = value;
        return true;
      },
      has: (target, prop) => {
        if (typeof prop === 'symbol' || RESERVED.has(prop) || prop in target) return true;
        return prop in target[ATTR];
      },
    });
  }

  get attributes(): Readonly<Record<string, unknown>> {
    return this[ATTR];
  }

  getKey(): string | number | null {
    const key = (this.constructor as ModelConstructor).primaryKey;
    const value = this[ATTR][key];
    return typeof value === 'string' || typeof value === 'number' ? value : null;
  }

  isPersisted(): boolean {
    return this.getKey() !== null;
  }

  fill(attributes: Record<string, unknown>): this {
    Object.assign(this[ATTR], attributes);
    return this;
  }

  toJSON(): Record<string, unknown> {
    return { ...this[ATTR] };
  }

  static crispy<T extends Model>(this: ModelConstructor<T>): Builder<T> {
    return new Builder<T>(this);
  }

  async save(): Promise<this> {
    const ctor = this.constructor as ModelConstructor;
    const key = this.getKey();
    const path = key === null ? ctor.uri : `${ctor.uri}/${key}`;
    const method = key === null ? 'POST' : 'PUT';
    const response = await request<{ data: Record<string, unknown> }>(path, {
      method,
      body: this.toJSON(),
    });
    this.fill(response.data);
    return this;
  }

  async delete(): Promise<void> {
    const ctor = this.constructor as ModelConstructor;
    const key = this.getKey();
    if (key === null) {
      throw new Error(`Cannot delete unpersisted ${ctor.name}: missing ${ctor.primaryKey}`);
    }
    await request<void>(`${ctor.uri}/${key}`, { method: 'DELETE' });
  }
}
