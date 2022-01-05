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
    return JSON.stringify(object);
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
