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
import { Operation } from 'fast-json-patch';

import { MessageType, ModelServerObjectV2 } from '.';
import { ModelServerMessage } from './model-server-message';
import { CommandExecutionResult } from './model/command-model';
import { Diagnostic } from './model/diagnostic';
import { AnyObject, isString } from './utils/type-util';

/**
 * A `ModelServerNotification` represents the payload object that is sent by the modelserver over websocket to
 * notify subscribers about the current model state.
 */
export interface ModelServerNotification {
    modelUri: string;
    type: string;
}

export namespace ModelServerNotification {
    export function is(object?: unknown): object is ModelServerNotification {
        return AnyObject.is(object) && isString(object, 'modelUri') && isString(object, 'type');
    }
}

/**
 * A `CloseNotification` is sent to notify subscribers that the subscription for a model has ended. Can be triggered
 * either directly by invoking the `unsubscribe` method of a `ModelServerClient` or indirectly
 * i.e. the websocket connection gets closed.
 */
export interface CloseNotification extends ModelServerNotification {
    /** The status code of the websocket connect */
    code: number;
    /** The reason why the subscription was closed */
    reason: string;
}

export namespace CloseNotification {
    export function is(object?: unknown): object is CloseNotification {
        return ModelServerNotification.is(object) && object.type === MessageType.close;
    }
}

/**
 * An `ErrorNotification` is sent to notify subscribers about an error occurred in connection with the subscribed the subscripted for.
 */
export interface ErrorNotification extends ModelServerNotification {
    /** The error that occurred. */
    error: unknown;
}

export namespace ErrorNotification {
    export function is(object?: unknown): object is ErrorNotification {
        return ModelServerNotification.is(object) && object.type === MessageType.error;
    }
}

/**
 * A `DirtyStateNotification` is sent to notify subscribers about dirty state changes.
 */
export interface DirtyStateNotification extends ModelServerNotification {
    /** Boolean flag to indicate wether the model is currently dirty */
    isDirty: boolean;
}

export namespace DirtyStateNotification {
    export function is(object?: unknown): object is DirtyStateNotification {
        return ModelServerNotification.is(object) && object.type === MessageType.dirtyState;
    }
}

/**
 * An `IncrementalUpdateNotification` is sent to notify subscribers about an incremental model change.
 * The incremental change is described using {@link CommandExecutionResult}.
 */
export interface IncrementalUpdateNotification extends ModelServerNotification {
    /** The description of the incremental change */
    result: CommandExecutionResult | string;
}

export namespace IncrementalUpdateNotification {
    export function is(object?: unknown): object is IncrementalUpdateNotification {
        return ModelServerNotification.is(object) && object.type === MessageType.incrementalUpdate;
    }
}

/**
 * An `IncrementalUpdateNotification` is sent to notify subscribers about an incremental model change.
 * The incremental change is described using JsonPatch {@link Operation}[]
 */
export interface IncrementalUpdateNotificationV2 extends ModelServerNotification {
    /** The description of the incremental change */
    patch: Operation[];

    /**
     * A function to apply the patch on the previous version of the model.
     * @param oldModel The model to patch.
     * @param copy by default, the patch will be directly applied to the oldModel, modifying
     * it in-place. If copy is true, the patch will be applied on a copy of the model, leaving
     * the original model unchanged.
     * @return the patched model.
     */
    patchModel(oldModel: ModelServerObjectV2, copy?: boolean): ModelServerObjectV2;
}

/**
 * A `FullUpdateNotification` is sent to notify subscribers about an model change.
 * The message contains the serialized updated model.
 * @typeParam M The concrete type of the updated model. Default is {@link AnyObject}.
 */
export interface FullUpdateNotification<M = AnyObject> extends ModelServerNotification {
    /** The model that has been updated */
    model: M | string;
}

export namespace FullUpdateNotification {
    export function is(object?: unknown): object is FullUpdateNotification {
        return ModelServerNotification.is(object) && object.type === MessageType.fullUpdate;
    }
}
/**
 * A `ValidationNotification` is sent to notify subscribers about the result of a validation request.
 * The validation result is described using {@link Diagnostic}.
 */
export interface ValidationNotification extends ModelServerNotification {
    /** The description of the validation result */
    diagnostic: Diagnostic;
}

export namespace ValidationNotification {
    export function is(object?: unknown): object is ValidationNotification {
        return ModelServerNotification.is(object) && object.type === MessageType.validationResult;
    }
}

/**
 * If the type of a incoming notification cannot be mapped to concrete subtype of {@link ModelServerNotification}
 * it defaults to the unknown type. Exposes the data property of the original {@link ModelServerMessage} to enable custom processing
 */
export type UnknownNotification = ModelServerNotification & ModelServerMessage;

export namespace UnknownNotification {
    export function is(object?: unknown): object is UnknownNotification {
        return ModelServerNotification.is(object) && MessageType.asMessageType(object.type) === MessageType.unknown;
    }
}
