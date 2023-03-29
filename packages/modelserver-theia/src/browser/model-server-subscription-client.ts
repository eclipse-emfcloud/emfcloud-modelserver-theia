/********************************************************************************
 * Copyright (c) 2019-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import {
    AnyObject,
    CloseNotification,
    CommandExecutionResult,
    Diagnostic,
    DirtyStateNotification,
    ErrorNotification,
    FullUpdateNotification,
    IncrementalUpdateNotification,
    IncrementalUpdateNotificationV2,
    MessageDataMapper,
    MessageType,
    ModelServerMessage,
    ModelServerNotification,
    Operations,
    UnknownNotification,
    ValidationNotification
} from '@eclipse-emfcloud/modelserver-client';
import { Emitter, Event } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';
import { applyPatch, deepClone } from 'fast-json-patch';
import WebSocket from 'isomorphic-ws';
import URI from 'urijs';

import { ModelServerFrontendClient } from '../common';

export const ModelServerSubscriptionService = Symbol.for('ModelServerSubscriptionService');
export interface ModelServerSubscriptionService {
    readonly onOpenListener: Event<ModelServerNotification>;
    readonly onClosedListener: Event<CloseNotification>;
    readonly onErrorListener: Event<ErrorNotification>;

    readonly onDirtyStateListener: Event<DirtyStateNotification>;
    readonly onIncrementalUpdateListener: Event<IncrementalUpdateNotification>;
    readonly onFullUpdateListener: Event<FullUpdateNotification>;
    readonly onSuccessListener: Event<ModelServerNotification>;
    readonly onUnknownMessageListener: Event<UnknownNotification>;
    readonly onValidationResultListener: Event<ValidationNotification>;
}

export const ModelServerSubscriptionServiceV2 = Symbol.for('ModelServerSubscriptionServiceV2');
export interface ModelServerSubscriptionServiceV2 extends ModelServerSubscriptionService {
    readonly onIncrementalUpdateListenerV2: Event<IncrementalUpdateNotificationV2>;
}

@injectable()
export class ModelServerSubscriptionClient implements ModelServerFrontendClient, ModelServerSubscriptionService {
    onOpen(modeluri: URI, _event: WebSocket.Event): void {
        this.onOpenEmitter.fire({ modeluri, type: MessageType.open });
    }

    onClose(modeluri: URI, event: WebSocket.CloseEvent): void {
        this.onClosedEmitter.fire({ modeluri, code: event.code, reason: event.reason, type: MessageType.close });
    }

    onError(modeluri: URI, event: WebSocket.ErrorEvent): void {
        this.onErrorEmitter.fire({ modeluri, error: event.error, type: MessageType.error });
    }

    onMessage(modeluri: URI, event: WebSocket.MessageEvent): void {
        const message = JSON.parse(event.data.toString());
        if (ModelServerMessage.is(message)) {
            const type = MessageType.asMessageType(message.type);
            switch (type) {
                case MessageType.dirtyState: {
                    this.onDirtyStateEmitter.fire({ modeluri, isDirty: MessageDataMapper.asBoolean(message), type });
                    break;
                }
                case MessageType.keepAlive:
                case MessageType.success: {
                    this.onSuccessEmitter.fire({ modeluri, type });
                    break;
                }
                case MessageType.error: {
                    this.onErrorEmitter.fire({ modeluri, error: MessageDataMapper.asString(message), type });
                    break;
                }
                case MessageType.incrementalUpdate: {
                    let result: CommandExecutionResult | string;
                    try {
                        result = MessageDataMapper.as(message, CommandExecutionResult.is);
                    } catch (error) {
                        result = MessageDataMapper.asString(message);
                    }
                    this.onIncrementalUpdateEmitter.fire({
                        modeluri,
                        result,
                        type
                    });
                    break;
                }
                case MessageType.fullUpdate: {
                    let model: AnyObject | string;
                    try {
                        model = MessageDataMapper.asObject(message);
                    } catch (error) {
                        model = MessageDataMapper.asString(message);
                    }
                    this.onFullUpdateEmitter.fire({ modeluri, model, type });
                    break;
                }
                case MessageType.validationResult: {
                    this.onValidationResultEmitter.fire({ modeluri, diagnostic: MessageDataMapper.as(message, Diagnostic.is), type });
                    break;
                }
                default: {
                    this.onUnknownMessageEmitter.fire({ ...message, modeluri });
                }
            }
        }
    }

    protected onOpenEmitter = new Emitter<Readonly<ModelServerNotification>>();
    get onOpenListener(): Event<ModelServerNotification> {
        return this.onOpenEmitter.event;
    }

    protected onClosedEmitter = new Emitter<Readonly<CloseNotification>>();
    get onClosedListener(): Event<CloseNotification> {
        return this.onClosedEmitter.event;
    }

    protected onErrorEmitter = new Emitter<Readonly<ErrorNotification>>();
    get onErrorListener(): Event<ErrorNotification> {
        return this.onErrorEmitter.event;
    }

    protected onDirtyStateEmitter = new Emitter<Readonly<DirtyStateNotification>>();
    get onDirtyStateListener(): Event<DirtyStateNotification> {
        return this.onDirtyStateEmitter.event;
    }

    protected onIncrementalUpdateEmitter = new Emitter<Readonly<IncrementalUpdateNotification>>();
    get onIncrementalUpdateListener(): Event<IncrementalUpdateNotification> {
        return this.onIncrementalUpdateEmitter.event;
    }
    protected onFullUpdateEmitter = new Emitter<Readonly<FullUpdateNotification>>();
    get onFullUpdateListener(): Event<FullUpdateNotification> {
        return this.onFullUpdateEmitter.event;
    }

    protected onSuccessEmitter = new Emitter<Readonly<ModelServerNotification>>();
    get onSuccessListener(): Event<ModelServerNotification> {
        return this.onSuccessEmitter.event;
    }

    protected onUnknownMessageEmitter = new Emitter<Readonly<UnknownNotification>>();
    get onUnknownMessageListener(): Event<UnknownNotification> {
        return this.onUnknownMessageEmitter.event;
    }

    protected onValidationResultEmitter = new Emitter<Readonly<ValidationNotification>>();
    get onValidationResultListener(): Event<ValidationNotification> {
        return this.onValidationResultEmitter.event;
    }
}

/**
 * Implementation of {@link ModelServerSubscriptionClient} compatible with API V2 Notifications,
 * supporting Json Patch for incremental updates.
 */
@injectable()
export class ModelServerSubscriptionClientV2 extends ModelServerSubscriptionClient implements ModelServerSubscriptionServiceV2 {
    protected onIncrementalUpdateEmitterV2 = new Emitter<Readonly<IncrementalUpdateNotificationV2>>();
    get onIncrementalUpdateListenerV2(): Event<IncrementalUpdateNotificationV2> {
        return this.onIncrementalUpdateEmitterV2.event;
    }

    onMessage(modeluri: URI, event: WebSocket.MessageEvent): void {
        const message = JSON.parse(event.data.toString());
        if (ModelServerMessage.is(message)) {
            const type = MessageType.asMessageType(message.type);
            switch (type) {
                case MessageType.incrementalUpdate: {
                    const patch = MessageDataMapper.as(message, Operations.isPatch);
                    this.onIncrementalUpdateEmitterV2.fire({
                        type,
                        modeluri,
                        patch,
                        patchModel: (model, copy) => {
                            const modelToPatch = copy ? deepClone(model) : model;
                            return applyPatch(modelToPatch, patch).newDocument;
                        }
                    });
                    break;
                }
            }
        }
        super.onMessage(modeluri, event);
    }
}
