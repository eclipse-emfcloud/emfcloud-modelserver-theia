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
import WebSocket from 'isomorphic-ws';

import { Operations } from '.';
import { MessageDataMapper, MessageType, ModelServerMessage } from './model-server-message';
import {
    CloseNotification,
    DirtyStateNotification,
    ErrorNotification,
    FullUpdateNotification,
    IncrementalUpdateNotification,
    IncrementalUpdateNotificationV2,
    ModelServerNotification,
    UnknownNotification,
    ValidationNotification
} from './model-server-notification';
import { CommandExecutionResult } from './model/command-model';
import { Diagnostic } from './model/diagnostic';

/**
 * A `SubscriptionListener` is used to react to subscription notifications received by the model server.
 * When a subscription is started the model server client attaches the listener to the websocket which handles the
 * notifications for the subscribed model.
 */
export interface SubscriptionListener {
    onOpen?(modelUri: string, event: WebSocket.Event): void;
    onClose?(modelUri: string, event: WebSocket.CloseEvent): void;
    onError?(modelUri: string, event: WebSocket.ErrorEvent): void;
    onMessage?(modelUri: string, event: WebSocket.MessageEvent): void;
}

/**
 * A `ModelServerNotificationListener` can be used to treat & handle messages received via {@link SubscriptionListener.onMessage} by
 * as
 */
export interface ModelServerNotificationListener {
    /**
     * Can be implemented to react to a subscription opened notifications.
     * @param notification The notification providing the url of the model whose subscription channel has been opened.
     */
    onOpen?(notification: ModelServerNotification): void;

    /**
     * Can be implemented to react to a {@link CloseNotification}s.
     * @param notification The close notification.
     */
    onClose?(notification: CloseNotification): void;

    /**
     * Can be implemented to react to {@link ErrorNotification}s.
     * @param notification The error notification.
     */
    onError?(notification: ErrorNotification): void;

    /**
     * Can be implemented to react to `success` notifications.
     * @param notification The notification providing the url of the model which caused the success notification.
     */
    onSuccess?(notification: ModelServerNotification): void;

    /**
     * Can be implemented to react to {@link DirtyStateNotification}s.
     * @param notification The dirty state notification.
     */
    onDirtyStateChanged?(notification: DirtyStateNotification): void;

    /**
     * Can be implemented to react to {@link IncrementalUpdateNotification}s.
     * @param notification The incremental update notification.
     */
    onIncrementalUpdate?(notification: IncrementalUpdateNotification): void;

    /**
     * Can be implemented to react to {@link FullUpdateNotification}s.
     * @param notification The full update notification.
     */
    onFullUpdate?(notification: FullUpdateNotification): void;

    /**
     * Can be implemented to react to {@link ValidationNotification}s.
     * @param notification The validation result notification.
     */
    onValidation?(notification: ValidationNotification): void;

    /**
     * Can be implemented to react to unknown subscription notifications. (e.g. custom notifications)
     * @param notification The unknown notification.
     */
    onUnknown?(notification: UnknownNotification): void;
}

/**
 * Default implementation of {@link SubscriptionListener} that maps received websocket events to the
 * corresponding {@link ModelServerNotification} and delegates them to the
 * {@link ModelServerNotificationListener} implementation passed via constructor.
 */
export class NotificationSubscriptionListener implements SubscriptionListener {
    constructor(protected notificationListener: ModelServerNotificationListener = {}) { }

    onOpen(modelUri: string, _event: WebSocket.Event): void {
        this.notificationListener.onOpen?.({ modelUri });
    }

    onClose(modelUri: string, event: WebSocket.CloseEvent): void {
        this.notificationListener.onClose?.({ modelUri, code: event.code, reason: event.reason });
    }

    onError(modelUri: string, event: WebSocket.ErrorEvent): void {
        this.notificationListener.onError?.({ modelUri, error: event.error });
    }

    onMessage(modelUri: string, event: WebSocket.MessageEvent): void {
        const message = JSON.parse(event.data.toString());
        if (ModelServerMessage.is(message)) {
            const type = MessageType.asMessageType(message.type);
            switch (type) {
                case MessageType.dirtyState: {
                    this.notificationListener.onDirtyStateChanged?.({ modelUri, isDirty: MessageDataMapper.asBoolean(message) });
                    break;
                }
                case MessageType.keepAlive:
                case MessageType.success: {
                    this.notificationListener.onSuccess?.({ modelUri });
                    break;
                }
                case MessageType.error: {
                    this.notificationListener.onError?.({ modelUri, error: MessageDataMapper.asString(message) });
                    break;
                }
                case MessageType.incrementalUpdate: {
                    this.notificationListener.onIncrementalUpdate?.({
                        modelUri,
                        result: MessageDataMapper.as(message, CommandExecutionResult.is)
                    });
                    break;
                }
                case MessageType.fullUpdate: {
                    this.notificationListener.onFullUpdate?.({ modelUri, model: MessageDataMapper.asObject(message) });
                    break;
                }
                case MessageType.validationResult: {
                    this.notificationListener.onValidation?.({ modelUri, diagnostic: MessageDataMapper.as(message, Diagnostic.is) });
                    break;
                }
                default: {
                    this.notificationListener.onUnknown?.({ ...message, modelUri });
                }
            }
        }
    }
}

/**
 * Default implementation of {@link SubscriptionListener} that maps received websocket events to the
 * corresponding {@link ModelServerNotification} and delegates them to the
 * {@link ModelServerNotificationListenerV2} implementation passed via constructor.
 *
 * This class supports the V2 Client API.
 */
export class NotificationSubscriptionListenerV2 extends NotificationSubscriptionListener {
    constructor(protected notificationListener: ModelServerNotificationListenerV2 = {}) {
        super(notificationListener);
    }

    onMessage(modelUri: string, event: WebSocket.MessageEvent): void {
        const message = JSON.parse(event.data.toString());
        if (ModelServerMessage.is(message)) {
            const type = MessageType.asMessageType(message.type);
            switch (type) {
                case MessageType.incrementalUpdate: {
                    this.notificationListener.onIncrementalUpdateV2?.({
                        modelUri,
                        patch: MessageDataMapper.as(message, Operations.isPatch)
                    });
                    break;
                }
                default: {
                    super.onMessage(modelUri, event);
                }
            }
        }
    }
}

/**
 * A {@link ModelServerNotificationListener} for V2 Client API. Uses JsonPatch for incremental
 * update notifications, instead of CommandExecutionResults.
 */
export interface ModelServerNotificationListenerV2 extends ModelServerNotificationListener {
    /**
     * Can be implemented to react to {@link IncrementalUpdateNotificationV2}s.
     * @param notification The incremental update notification.
     */
    onIncrementalUpdateV2?(notification: IncrementalUpdateNotificationV2): void;
}
