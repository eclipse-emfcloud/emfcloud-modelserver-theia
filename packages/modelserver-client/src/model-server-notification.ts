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
import { ModelServerMessage } from './model-server-message';
import { CommandExecutionResult } from './model/command-model';
import { Diagnostic } from './model/diagnostic';
import { AnyObject } from './utils/type-util';

/**
 * A `ModelServerNotification` represents the payload object that is sent by the modelserver over websocket to
 * notify subscribers about the current model state.
 */
export interface ModelServerNotification {
    modelUri: string;
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

/**
 * An `ErrorNotification` is sent to notify subscribers about an error occurred in connection with the subscribed the subscripted for.
 */
export interface ErrorNotification extends ModelServerNotification {
    /** The error that occurred. */
    error: unknown;
}

/**
 * A `DirtyStateNotification` is sent to notify subscribers about dirty state changes.
 */
export interface DirtyStateNotification extends ModelServerNotification {
    /** Boolean flag to indicate wether the model is currently dirty */
    isDirty: boolean;
}

/**
 * An `IncrementalUpdateNotification` is sent to notify subscribers about an incremental model change.
 * The incremental change is described using {@link CommandExecutionResult}.
 */
export interface IncrementalUpdateNotification extends ModelServerNotification {
    /** The description of the incremental change */
    result: CommandExecutionResult;
}

/**
 * An `IncrementalUpdateNotification` is sent to notify subscribers about an incremental model change.
 * The incremental change is described using JsonPatch {@link Operation}[]
 */
export interface IncrementalUpdateNotificationV2 extends ModelServerNotification {
    /** The description of the incremental change */
    patch: Operation[];
}

/**
 * A `FullUpdateNotification` is sent to notify subscribers about an model change.
 * The message contains the serialized updated model.
 * @typeParam M The concrete type of the updated model. Default is {@link AnyObject}.
 */
export interface FullUpdateNotification<M = AnyObject> extends ModelServerNotification {
    /** The model that has been updated */
    model: M;
}

/**
 * A `ValidationNotification` is sent to notify subscribers about the result of a validation request.
 * The validation result is described using {@link Diagnostic}.
 */
export interface ValidationNotification extends ModelServerNotification {
    /** The description of the validation result */
    diagnostic: Diagnostic;
}

/**
 * If the type of a incoming notification cannot be mapped to concrete subtype of {@link ModelServerNotification}
 * it defaults to the unknown type. Exposes the data property of the original {@link ModelServerMessage} to enable custom processing
 */
export type UnknownNotification = ModelServerNotification & ModelServerMessage;
