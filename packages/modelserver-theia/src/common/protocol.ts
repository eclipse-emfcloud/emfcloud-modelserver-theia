/********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import {
    ModelServerClientApiV1,
    ModelServerClientApiV2,
    SubscriptionListener,
    SubscriptionOptionsV2
} from '@eclipse-emfcloud/modelserver-client';
import { JsonRpcServer } from '@theia/core';
import WebSocket from 'isomorphic-ws';
import URI from 'urijs';

export const MODEL_SERVER_CLIENT_SERVICE_PATH = '/services/modelserverclient';
export const MODEL_SERVER_CLIENT_V2_SERVICE_PATH = '/services/modelserverclient/v2';

export const ModelServerFrontendClient = Symbol.for('ModelServerFrontendClient');
export interface ModelServerFrontendClient {
    onOpen(modeluri: URI, event: WebSocket.Event): void;
    onClose(modeluri: URI, event: WebSocket.CloseEvent): void;
    onError(modeluri: URI, event: WebSocket.ErrorEvent): void;
    onMessage(modeluri: URI, event: WebSocket.MessageEvent): void;
}

export const TheiaModelServerClient = Symbol.for('TheiaModelServerClient');
export interface TheiaModelServerClient extends ModelServerClientApiV1, JsonRpcServer<ModelServerFrontendClient> {}

export const TheiaModelServerClientV2 = Symbol.for('TheiaModelServerClientV2');
export interface TheiaModelServerClientV2 extends ModelServerClientApiV2, JsonRpcServer<ModelServerFrontendClient> {
    /**
     * Subscribe to model notifications. In the Theia context, the `listener` parameter is optional because
     * it defaults to the frontend client proxy.
     *
     * @param modeluri the URI of the model to which to subscribe
     * @param listener the subscription listener. If omitted, the front-end client is substituted. This lets the
     * client handle both Theia RPC events and the messages from the _Model Server_
     * @param options optional subscription options, including message format, time-out, and message filtering
     */
    subscribe(modeluri: URI, listener?: SubscriptionListener, options?: SubscriptionOptionsV2): SubscriptionListener;

    /**
     * Subscribe the frontend client of the remote `TheiaModelServerClientV2` service as
     * the `SubscriptionListener` handler for model notifications. This is
     * equivalent to passing `undefined` as the second argument to the {@link subscribe} method.
     *
     * @param modeluri the URI of the model to which to subscribe
     * @param options optional subscription options, including message format, time-out, and message filtering
     */
    selfSubscribe(modeluri: URI, options?: SubscriptionOptionsV2): void;
}
