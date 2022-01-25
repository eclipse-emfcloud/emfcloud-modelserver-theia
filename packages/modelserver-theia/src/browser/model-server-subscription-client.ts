/********************************************************************************
 * Copyright (c) 2019-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import {
    AnyObject,
    CloseNotification,
    CommandExecutionResult,
    Diagnostic,
    DirtyStateNotification,
    ErrorNotification,
    FullUpdateNotification,
    IncrementalUpdateNotification,
    MessageDataMapper,
    MessageType,
    ModelServerMessage,
    ModelServerNotification,
    UnknownNotification,
    ValidationNotification
} from '@eclipse-emfcloud/modelserver-client';
import { Emitter, Event } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';
import WebSocket from 'isomorphic-ws';

import { ModelServerFrontendClient } from '../common';

export const ModelServerSubscriptionService = Symbol('ModelServerSubscriptionService');
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
@injectable()
export class ModelServerSubscriptionClient implements ModelServerFrontendClient, ModelServerSubscriptionService {
    onOpen(modelUri: string, _event: WebSocket.Event): void {
        this.onOpenEmitter.fire({ modelUri, type: MessageType.open });
    }

    onClose(modelUri: string, event: WebSocket.CloseEvent): void {
        this.onClosedEmitter.fire({ modelUri, code: event.code, reason: event.reason, type: MessageType.close });
    }

    onError(modelUri: string, event: WebSocket.ErrorEvent): void {
        this.onErrorEmitter.fire({ modelUri, error: event.error, type: MessageType.error });
    }

    onMessage(modelUri: string, event: WebSocket.MessageEvent): void {
        const message = JSON.parse(event.data.toString());
        if (ModelServerMessage.is(message)) {
            const type = MessageType.asMessageType(message.type);
            switch (type) {
                case MessageType.dirtyState: {
                    this.onDirtyStateEmitter.fire({ modelUri, isDirty: MessageDataMapper.asBoolean(message), type });
                    break;
                }
                case MessageType.keepAlive:
                case MessageType.success: {
                    this.onSuccessEmitter.fire({ modelUri, type });
                    break;
                }
                case MessageType.error: {
                    this.onErrorEmitter.fire({ modelUri, error: MessageDataMapper.asString(message), type });
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
                        modelUri,
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
                    this.onFullUpdateEmitter.fire({ modelUri, model, type });
                    break;
                }
                case MessageType.validationResult: {
                    this.onValidationResultEmitter.fire({ modelUri, diagnostic: MessageDataMapper.as(message, Diagnostic.is), type });
                    break;
                }
                default: {
                    this.onUnknownMessageEmitter.fire({ ...message, modelUri });
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
