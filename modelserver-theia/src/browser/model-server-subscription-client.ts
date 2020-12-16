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
import { injectable, multiInject } from 'inversify';

import {
    ModelServerMessage,
    ModelServerSubscriptionClient,
    ModelServerSubscriptionListener,
    WebSocketCloseEvent,
    WebSocketErrorEvent,
    WebSocketEvent,
    WebSocketMessageEvent
} from '../common';

@injectable()
export class DefaultModelServerSubscriptionClient implements ModelServerSubscriptionClient {

    @multiInject(ModelServerSubscriptionListener) private readonly listeners: ModelServerSubscriptionListener[];

    fireOpenEvent(event: WebSocketEvent, modelUri: string): void {
        this.listeners.forEach(listener => listener.onOpened(modelUri));
    }

    fireMessageEvent(event: WebSocketMessageEvent, modelUri: string): void {
        const message = JSON.parse(event.data.toString()) as ModelServerMessage;
        switch (message.type) {
            case 'dirtyState': {
                this.listeners.forEach(listener => listener.onDirtyState(modelUri, message.data));
                break;
            }
            case 'fullUpdate': {
                this.listeners.forEach(listener => listener.onFullUpdate(modelUri, message.data));
                break;
            }
            case 'incrementalUpdate': {
                this.listeners.forEach(listener => listener.onIncrementalUpdate(modelUri, message.data));
                break;
            }
            case 'success':
            case 'keepAlive': {
                this.listeners.forEach(listener => listener.onSuccess(modelUri, message.data));
                break;
            }
            case 'error': {
                this.listeners.forEach(listener => listener.onError(modelUri, message.data));
                break;
            }
            default: {
                this.listeners.forEach(listener => listener.onUnknownMessage(modelUri, message.data));
            }
        }
    }

    fireClosedEvent(event: WebSocketCloseEvent, modelUri: string): void {
        let closeReason = event.reason;
        switch (event.code) {
            case 1005: {
                closeReason = 'Connection closed by peer'; break;
            }
            case 1006: {
                closeReason = 'Server shutdown'; break;
            }
        }
        this.listeners.forEach(listener => listener.onClosed(modelUri, event.code + ': ' + closeReason));
    }

    fireErrorEvent(event: WebSocketErrorEvent, modelUri: string): void {
        this.listeners.forEach(listener => listener.onError(modelUri, event.error));
    }

    fireUserWarning(warning: string, modelUri: string): void {
        this.listeners.forEach(listener => listener.onWarning(modelUri, warning));
    }
}
