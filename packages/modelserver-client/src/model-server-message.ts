/********************************************************************************
 * Copyright (c) 2021-2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import * as jsonpatch from 'fast-json-patch';

import { ModelUpdateResult } from './model-server-client-api-v2';
import { ModelServerElement } from './model/base-model';
import { Operations } from './utils/patch-utils';
import * as Type from './utils/type-util';

/**
 * A `ModelServerMessage` represents the data payload that is sent by the modelserver
 * when responding to incoming requests. It's also used by the client to send messages (e.g. keepAlive messages)
 * to the server.
 * @typeParam D Concrete type of the `data` property. Default is `unknown`.
 */
export interface ModelServerMessage<D = unknown> {
    /** The message data */
    data: D;
    /** The message type. Is a literal of {@link MessageType} unless the modelserver has been extended with custom types */
    type: string;
}

export namespace ModelServerMessage {
    /**
     * Guard guard to check wether a given object is of type {@link ModelServerMessage}.
     * @param object The object to check.
     * @returns The given object as {@link ModelServerMessage} or `false`.
     */
    export function is(object: unknown): object is ModelServerMessage {
        return Type.AnyObject.is(object) && Type.isString(object, 'type') && (object as any).data !== undefined;
    }
}

/**
 * Enumeration of the default types of a {@link ModelServerMessage}.
 */
// eslint-disable-next-line no-shadow
export enum MessageType {
    success = 'success',
    warning = 'warning',
    error = 'error',
    open = 'open',
    close = 'close',
    fullUpdate = 'fullUpdate',
    incrementalUpdate = 'incrementalUpdate',
    dirtyState = 'dirtyState',
    validationResult = 'validationResult',
    keepAlive = 'keepAlive',
    unknown = 'unknown'
}

export namespace MessageType {
    /**
     * Maps the given string to an literal of {@link MessageType}
     * @param value The string to map.
     * @returns the mapped message type literal. If the given string cannot be mapped to an
     *          exact type {@link MessageType.unknown} is returned.
     */
    export function asMessageType(value: string): MessageType {
        if (value in MessageType) {
            return (MessageType as any)[value];
        }
        return MessageType.unknown;
    }
}

/**
 * Representation of an arbitrary model.
 * @typeParam C Concrete type of the `content` property. Default is `unknown`.
 */
export interface Model<C = unknown> {
    /** The uri of the model. */
    modelUri: string;
    /** The model content. */
    content: C;
}

export namespace Model {
    /**
     * Guard function to check wether a given object is of type {@link Model}.
     * @param object The object to check.
     * @returns The given object as {@link Model} or `false`.
     */
    export function is(object: unknown): object is Model {
        return Type.AnyObject.is(object) && Type.isString(object, 'modelUri') && Type.isObject(object, 'content');
    }
}

/**
 * Type to describe a function that maps a message to a specific type.
 */
export type Mapper<M, D = unknown> = (message: M) => D;

/**
 * A Mapper which directly returns the message.
 */
export const IdentityMapper: Mapper<any, any> = m => m;

/**
 * Type to describe a function that maps the {@link ModelServerMessage.data} property to a specific type.
 */
export type MessageDataMapper<D = unknown> = (message: ModelServerMessage) => D;

/**
 * A collection of utility functions to map the `data` property of a {@link ModelServerMessage} to a specific type.
 * If the `data` object of the given message cannot be mapped to the desired type an error is thrown.
 */
export namespace MessageDataMapper {
    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to string.
     * @param message The message to map.
     * @returns the `data` property as `string`.
     */
    export function asString(message: ModelServerMessage): string {
        return Type.asString(message.data);
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to a string[].
     * @param message The message to map.
     * @returns The `data` property as `string[]`.
     * @throws {@link Error} if the 'data' property is not an array.
     */
    export function asStringArray(message: ModelServerMessage): string[] {
        return Type.asStringArray(message.data);
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to a boolean.
     * @param message The message to map.
     * @returns The `data` property as boolean or `false` if `data` is not of type `boolean`.
     */
    export function asBoolean(message: ModelServerMessage): boolean {
        return typeof message.data === 'boolean' ? message.data : false;
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to a {@link Model}[].
     * @param message The message to map.
     * @returns The `data` property as `Model[]`.
     * @throws {@link Error} if the 'data' property is not an array.
     */
    export function asModelArray(message: ModelServerMessage): Model[] {
        return Type.asModelArray(message.data);
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to an {@link AnyObject}.
     * @param message The message to map.
     * @returns The `data` property as `AnyObject`.
     * @throws {@link Error} if the 'data' property is not of type `object`.
     */
    export function asObject(message: ModelServerMessage): Type.AnyObject {
        return Type.asObject(message.data);
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to the desired type if the data object passes the
     * check with the given typeguard successfully.
     * @param message The message to map.
     * @param typeGuard A type guard function to check wether the data object is of the desired type.
     * @typeParam T Concrete type to which the message should be mapped.
     * @returns The `data` property as the desired type
     * @throws {@link Error} if the check with the given typeguard fails.
     */
    export function as<T>(message: ModelServerMessage, guard: Type.TypeGuard<T>): T {
        return Type.asType(message.data, guard);
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to a `boolean` indicating whether the message
     * has the {@link MessageType.success} type.
     * @param message The message to map.
     * @returns `true` if the type of the message is {@link MessageType.success}, `false` otherwise.
     */
    export function isSuccess(message: ModelServerMessage): boolean {
        return message.type === 'success';
    }

    /**
     * Maps the {@link ModelServerMessage.data} property of the given message to a {@link ModelUpdateResult}, indicating
     * if the edit operation was successful (success: true), and if it was, how to patch the original model
     * to get the updated version of the model.
     *
     * @param message The message to map.
     * @returns a {@link ModelUpdateResult} indicating if the operation was successful, and how to patch the local
     * model to get the new model if it was.
     */
    export function patchModel(message: ModelServerMessage): ModelUpdateResult {
        if (isSuccess(message)){
            const data = message.data as any;
            const patch = data ? data.patch : undefined;
            if (patch && Operations.isPatch(patch)) {
                return {
                    success: isSuccess(message),
                    patch: oldModel => jsonpatch.applyPatch(oldModel, patch).newDocument as ModelServerElement
                };
            } else {
                return { success: true };
            }
        } else {
            return {success: false };
        }
    }
}
