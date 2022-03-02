/*********************************************************************************
 * Copyright (c) 2021-2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *********************************************************************************/
import { Format, FORMAT_JSON_V1, FORMAT_JSON_V2, FORMAT_XMI, JsonFormat } from '../model-server-client-api-v2';
import { Model } from '../model-server-message';

/**
 * The built-in 'object' & 'Object' types are currently hard to use
 * an should be avoided. It's recommended to use Record instead to describe the
 * type meaning of "any object";
 */
export type AnyObject = Record<PropertyKey, unknown>;

export namespace AnyObject {
    /**
     * Type guard to check wether a given object is of type {@link AnyObject}.
     * @param object The object to check.
     * @returns The given object as {@link AnyObject} or `false`.
     */
    export function is(object: unknown): object is AnyObject {
        // eslint-disable-next-line no-null/no-null
        return object !== null && typeof object === 'object';
    }
}

/**
 * Type that describes a type guard function for a specific type.
 * Takes any object as input and verifies wether the object is of the given concrete type.
 * @typeParam T the concrete type
 */
export type TypeGuard<T> = (object: unknown) => object is T;

/**
 * Validates whether the given object as a property of type `string` with the given key.
 * @param object The object that should be validated
 * @param propertyKey The key of the property
 * @returns `true` if the object has property with matching key of type `string`
 */
export function isString(object: AnyObject, propertyKey: string): boolean {
    return propertyKey in object && typeof object[propertyKey] === 'string';
}

/**
 * Validates whether the given object as a property of type `boolean` with the given key.
 * @param object The object that should be validated
 * @param propertyKey The key of the property
 * @returns `true` if the object has property with matching key of type `boolean`
 */
export function isBoolean(object: AnyObject, propertyKey: string): boolean {
    return propertyKey in object && typeof object[propertyKey] === 'boolean';
}

/**
 * Validates whether the given object as a property of type `number` with the given key.
 * @param object The object that should be validated
 * @param propertyKey The key of the property
 * @returns `true` if the object has property with matching key of type `number`
 */
export function isNumber(object: AnyObject, propertyKey: string): boolean {
    return propertyKey in object && typeof object[propertyKey] === 'number';
}

/**
 * Validates whether the given object as a property of type `object` with the given key.
 * @param object The object that should be validated
 * @param propertyKey The key of the property
 * @returns `true` if the object has property of type {@link AnyObject}
 */
export function isObject(object: AnyObject, propertyKey: string): boolean {
    return propertyKey in object && AnyObject.is(object[propertyKey]);
}

/**
 * Validates whether the given object as a property of type `Array` with the given key.
 * @param object The object that should be validated
 * @param propertyKey The key of the property
 * @returns `true` if the object has property with matching key of type `Array`
 */
export function isArray(object: AnyObject, propertyKey: string): boolean {
    return propertyKey in object && Array.isArray(object[propertyKey]);
}

/**
 * Maps the given object to `string`.
 * @param object The object to map
 * @returns The object as `string`
 */
export function asString(object: unknown): string {
    if (typeof object === 'string') {
        return object;
    }
    return JSON.stringify(object, undefined, 2);
}

/**
 * Maps the given object to a `string` array.
 * @param object The object to map
 * @returns The object as `string` array
 * @throws {@link Error} if the given object is not an array
 */
export function asStringArray(object: unknown): string[] {
    if (Array.isArray(object)) {
        return object.map(asString);
    }
    throw new Error('Cannot map to string[]. Given parameter is not an array!');
}

/**
 * Checks wether the given object is a defined object of type `object`.
 * @param object The object to check
 * @returns The correctly typed object
 * @throws {@link Error} if the given object is not defined or of type 'object'.
 */
export function asObject(object: unknown): AnyObject {
    if (AnyObject.is(object)) {
        return object;
    }
    throw new Error('Cannot map to object! Given parameter is not a defined object');
}

/**
 * Maps the given object to a concrete Type `T`.
 * @param object The object to map
 * @param guard  The type guard function to test the given object against
 * @returns The object as type `T`
 * @throws {@link Error} if the given object fails the type guard check
 */
export function asType<T>(object: unknown, guard: TypeGuard<T>): T {
    if (guard(object)) {
        return object;
    }
    throw new Error('Cannot map to given type. Given parameter failed the type guard check!');
}

export function asModelArray(object: unknown): Model[] {
    if (AnyObject.is(object)) {
        return Object.entries(object).map(entry => ({ modelUri: entry[0], content: entry[1] }));
    }

    throw new Error('Cannot map to Model[]. The given object is no defined or of type "object"!');
}

/** Protocol of a message encoder. */
export type Encoder<T = unknown> = (object: string | AnyObject) => T | string;

/**
 * Obtain a message encoder for the request body.
 *
 * @param format the encoding format
 * @returns the request body encoder format
 */
export function encodeRequestBody(format: Format): Encoder<{ data: any }> {
    const encoder = encode(format);

    return object => ({ data: encoder(object) });
}

/**
 * Obtain a message encoder.
 *
 * @param format the encoding format
 * @returns the encoder
 */
export function encode(format: Format): Encoder {
    switch (format) {
        case FORMAT_XMI:
            return asXML;
        case FORMAT_JSON_V1:
            return handleString(asJsonV1);
        case FORMAT_JSON_V2:
            return handleString(asJsonV2);
        default:
            throw new Error(`Unsupported message format: ${format}`);
    }
}

/**
 * Wrap an encoder to handle string inputs. When the input is a string,
 * it is parsed to convert the internal JSON structure to the appropriate
 * JSON format and then unparsed back to a string for serialization.
 *
 * @param fn an encoder
 * @returns the wrapped encoder
 */
function handleString<T>(fn: Encoder<T>): Encoder<T> {
    return (target: string | AnyObject) => {
        if (typeof target === 'string') {
            const parsed = JSON.parse(target);
            const result = fn(parsed);
            return JSON.stringify(result);
        }
        return fn(target);
    };
}

function asXML(object: string | AnyObject): string {
    if (typeof object !== 'string') {
        throw new Error('Attempt to encode non-string as XML');
    }
    return object;
}

function asJsonV1(object: AnyObject): any {
    return isJsonV1(object) ? object : copy(object, FORMAT_JSON_V1);
}

function asJsonV2(object: AnyObject): any {
    return isJsonV2(object) ? object : copy(object, FORMAT_JSON_V2);
}

function isJsonV1(object: AnyObject): boolean {
    return findProperty(object, 'eClass');
}

function isJsonV2(object: AnyObject): boolean {
    return findProperty(object, '$type');
}

function findProperty(object: any, name: string, visited = new Set()): boolean {
    return traverse(object, (target, props) => props.includes(name) ? true : undefined);
}

/**
 * Copy an object graph for the sole purpose of writing over the wire in a JSON format.
 *
 * @param object the object graph to copy
 * @param format the JSON format in which to copy it
 * @returns the copied object graph
 */
function copy(object: any, format: JsonFormat): any {
    // A map of original to copy
    const copies: Map<any, any> = new Map();

    const copier = (target: any): void => {
        const theCopy = { ...target };

        if (format === FORMAT_JSON_V1 && '$type' in theCopy) {
            theCopy.eClass = theCopy.$type;
            delete theCopy.$type;
        } else if (format === FORMAT_JSON_V2 && 'eClass' in theCopy) {
            theCopy.$type = theCopy.eClass;
            delete theCopy.eClass;
        }

        copies.set(target, theCopy);
    };

    const referencer = (target: any, props: string[]): void => {
        const copyGetter = (o: any): any => copies.get(o) ?? o;

        // We want to traverse all properties of object type; already guarded via `getOwnPropertyNames`.
        // eslint-disable-next-line guard-for-in
        for (const prop of props) {
            const value = target[prop];

            if (isNonEmptyObjectArray(value)) {
                target[prop] = value.map(copyGetter);
            } else if (Array.isArray(value)) {
                // It's an array of non-object data types
                target[prop] = [...value];
            } else if (typeof value === 'object') {
                target[prop] = copyGetter(value);
            }
        }
    };

    // Step one: copy everything
    traverse(object, copier);
    const result = copies.get(object);

    // Step two: then rewrite cross-references
    traverse(result, referencer);

    return result;
}

function traverse<T>(object: any, fn: (target: any, props: string[]) => T | undefined, visited = new Set()): boolean {
    if (visited.has(object)) {
        return false;
    }
    visited.add(object);

    const ownProps = Object.getOwnPropertyNames(object);

    const result = fn(object, ownProps);
    if (result !== undefined) {
        return true;
    }

    // We want to traverse all properties of object type; already guarded via `getOwnPropertyNames`.
    // eslint-disable-next-line guard-for-in
    for (const prop of ownProps) {
        const value = object[prop];

        if (isNonEmptyObjectArray(value) && value.some(element => traverse(element, fn, visited))) {
            return true;
        }

        if (typeof value === 'object' && traverse(value, fn, visited)) {
            return true;
        }
    }

    return false;
}

function isNonEmptyObjectArray(value: any): value is AnyObject[] {
    return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && !Array.isArray(value[0]);
}
