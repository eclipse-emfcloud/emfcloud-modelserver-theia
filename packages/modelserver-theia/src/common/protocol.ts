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
import { ModelServerClientApiV1 } from '@eclipse-emfcloud/modelserver-client';
import { JsonRpcServer } from '@theia/core';
import WebSocket from 'isomorphic-ws';

export const MODEL_SERVER_CLIENT_SERVICE_PATH = '/services/modelserverclient';

export const ModelServerFrontendClient = Symbol('ModelServerFrontendClient');
export interface ModelServerFrontendClient {
    onOpen(modelUri: string, event: WebSocket.Event): void;
    onClose(modelUri: string, event: WebSocket.CloseEvent): void;
    onError(modelUri: string, event: WebSocket.ErrorEvent): void;
    onMessage(modelUri: string, event: WebSocket.MessageEvent): void;
}

export const TheiaModelServerClient = Symbol('TheiaModelServerClient');
export interface TheiaModelServerClient extends ModelServerClientApiV1, JsonRpcServer<ModelServerFrontendClient> {}
