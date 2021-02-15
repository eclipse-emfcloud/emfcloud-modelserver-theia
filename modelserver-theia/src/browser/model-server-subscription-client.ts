/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { Emitter, Event } from '@theia/core';
import { injectable } from 'inversify';

import {
    ModelServerFrontendClient,
    ModelServerMessage,
    ModelServerResponse,
    ModelServerSubscriptionService,
    WebSocketCloseEvent,
    WebSocketErrorEvent,
    WebSocketEvent,
    WebSocketMessageEvent
} from '../common/model-server-api';

@injectable()
export class ModelServerSubscriptionClient implements ModelServerFrontendClient, ModelServerSubscriptionService {
    onOpen(event: WebSocketEvent, modelUri: string): void {
        this.onOpenEmitter.fire({ modelUri: modelUri, data: undefined });
    }

    onMessage(event: WebSocketMessageEvent, modelUri: string): void {
        const message = JSON.parse(event.data.toString()) as ModelServerMessage;
        message.modelUri = modelUri;
        switch (message.type) {
            case 'dirtyState': {
                this.onDirtyStateEmitter.fire(message);
                break;
            }
            case 'fullUpdate': {
                this.onFullUpdateEmitter.fire(message);
                break;
            }
            case 'incrementalUpdate': {
                this.onIncrementalUpdateEmitter.fire(message);
                break;
            }
            case 'success':
            case 'keepAlive': {
                this.onSuccessEmitter.fire(message);
                break;
            }
            case 'error': {
                this.onErrorEmitter.fire(message);
                break;
            }
            case 'validationResult': {
                this.onValidationResultEmitter.fire(message);
                break;
            }
            default: {
                this.onUnknownMessageEmitter.fire(message);
            }
        }
    }

    onClosed(event: WebSocketCloseEvent, modelUri: string): void {
        switch (event.code) {
            case 1005: {
                event.reason = 'Connection closed by peer'; break;
            }
            case 1006: {
                event.reason = 'Server shutdown'; break;
            }
        }
        this.onClosedEmitter.fire({ data: event.reason, modelUri: modelUri });
    }

    onError(event: WebSocketErrorEvent, modelUri: string): void {
        this.onErrorEmitter.fire({ data: event.error, modelUri: modelUri });
    }

    protected onOpenEmitter = new Emitter<Readonly<ModelServerResponse>>();
    get onOpenListener(): Event<ModelServerResponse> {
        return this.onOpenEmitter.event;
    }

    protected onClosedEmitter = new Emitter<Readonly<ModelServerResponse>>();
    get onClosedListener(): Event<ModelServerResponse> {
        return this.onClosedEmitter.event;
    }

    protected onErrorEmitter = new Emitter<Readonly<ModelServerResponse>>();
    get onErrorListener(): Event<ModelServerResponse> {
        return this.onErrorEmitter.event;
    }

    protected onDirtyStateEmitter = new Emitter<Readonly<ModelServerMessage>>();
    get onDirtyStateListener(): Event<ModelServerMessage> {
        return this.onDirtyStateEmitter.event;
    }

    protected onIncrementalUpdateEmitter = new Emitter<Readonly<ModelServerMessage>>();
    get onIncrementalUpdateListener(): Event<ModelServerMessage> {
        return this.onIncrementalUpdateEmitter.event;
    }
    protected onFullUpdateEmitter = new Emitter<Readonly<ModelServerMessage>>();
    get onFullUpdateListener(): Event<ModelServerMessage> {
        return this.onFullUpdateEmitter.event;
    }

    protected onSuccessEmitter = new Emitter<Readonly<ModelServerMessage>>();
    get onSuccessListener(): Event<ModelServerMessage> {
        return this.onSuccessEmitter.event;
    }

    protected onUnknownMessageEmitter = new Emitter<Readonly<ModelServerMessage>>();
    get onUnknownMessageListener(): Event<ModelServerMessage> {
        return this.onUnknownMessageEmitter.event;
    }

    protected onValidationResultEmitter = new Emitter<Readonly<ModelServerMessage>>();
    get onValidationResultListener(): Event<ModelServerMessage> {
        return this.onValidationResultEmitter.event;
    }
}
