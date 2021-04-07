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
import { Event, JsonRpcServer } from '@theia/core';
import * as WebSocket from 'ws';

import { ModelServerCommand } from './command-model';

export const MODEL_SERVER_CLIENT_SERVICE_PATH = '/services/modelserverclient';

export interface WebSocketEvent {
    target?: WebSocket;
}

export interface WebSocketMessageEvent extends WebSocketEvent {
    type: string; // 'open' | 'message' | 'error' | 'close'
    data: WebSocket.Data; // ModelServerMessage
}

export interface WebSocketCloseEvent extends WebSocketEvent {
    wasClean: boolean;
    code: number;
    reason: string;
}

export interface WebSocketErrorEvent extends WebSocketEvent {
    error: any;
    message: string;
    type: string;
}

export interface Model {
    modelUri: string;
    content: string;
}

export const ModelServerFrontendClient = Symbol('ModelServerFrontendClient');
export interface ModelServerFrontendClient {
    onOpen(event: WebSocketEvent, modelUri: string): void;
    onMessage(event: WebSocketMessageEvent, modelUri: string): void;
    onClosed(event: WebSocketCloseEvent, modelUri: string): void;
    onError(event: WebSocketErrorEvent, modelUri: string): void;
}

export const ModelServerSubscriptionService = Symbol('ModelServerSubscriptionService');
export interface ModelServerSubscriptionService {
    readonly onOpenListener: Event<ModelServerResponse>;
    readonly onClosedListener: Event<ModelServerResponse>;
    readonly onErrorListener: Event<ModelServerResponse>;

    readonly onDirtyStateListener: Event<ModelServerMessage>;
    readonly onIncrementalUpdateListener: Event<ModelServerMessage>;
    readonly onFullUpdateListener: Event<ModelServerMessage>;
    readonly onSuccessListener: Event<ModelServerMessage>;
    readonly onUnknownMessageListener: Event<ModelServerMessage>;
    readonly onValidationResultListener: Event<ModelServerMessage>;
}

export const ModelServerClient = Symbol('ModelServerClient');
export interface ModelServerClient extends JsonRpcServer<ModelServerFrontendClient> {
    initialize(): Promise<boolean>;

    get(modelUri: string, format?: string): Promise<Response<string>>;
    getAll(format?: string): Promise<Response<Model[]>>;
    getModelUris(): Promise<Response<string[]>>;

    getElementById(modelUri: string, elementid: string, format?: string): Promise<Response<string>>;
    getElementByName(modelUri: string, elementname: string, format?: string): Promise<Response<string>>;

    delete(modelUri: string): Promise<Response<boolean>>;
    // snapshot update
    update(modelUri: string, newModel: any): Promise<Response<string>>;

    configure(configuration?: ServerConfiguration): Promise<Response<boolean>>;
    ping(): Promise<Response<boolean>>;

    undo(modelUri: string): Promise<Response<string>>;
    redo(modelUri: string): Promise<Response<string>>;
    save(modelUri: string): Promise<Response<boolean>>;
    saveAll(): Promise<Response<boolean>>;

    getLaunchOptions(): Promise<LaunchOptions>;

    edit(modelUri: string, command: ModelServerCommand): Promise<Response<boolean>>;

    getTypeSchema(modelUri: string): Promise<Response<string>>;
    getUiSchema(schemaName: string): Promise<Response<string>>;

    validation(modelUri: string): Promise<Response<string>>;
    validationConstraints(modelUri: string): Promise<Response<string>>;

    // WebSocket connection
    subscribe(modelUri: string): void;
    subscribeWithValidation(modelUri: string): void;
    subscribeWithFormat(modelUri: string, format: string): void;
    subscribeWithTimeout(modelUri: string, timeout: number): void;
    subscribeWithTimeoutAndFormat(modelUri: string, timeout: number, format: string): void;
    sendKeepAlive(modelUri: string): void;
    unsubscribe(modelUri: string): void;
}

export const LaunchOptions = Symbol('LaunchOptions');
export interface LaunchOptions {
    baseURL: string;
    serverPort: number;
    hostname: string;
    jarPath?: string;
    additionalArgs?: string[];
}

export const DEFAULT_LAUNCH_OPTIONS: LaunchOptions = {
    baseURL: 'api/v1',
    serverPort: 8081,
    hostname: 'localhost'
};

export interface ServerConfiguration {
    workspaceRoot: string;
    uiSchemaFolder?: string;
}

export interface ModelServerResponse {
    modelUri: string;
    data: any;
}

export interface ModelServerMessage extends ModelServerResponse {
    type: 'dirtyState' | 'incrementalUpdate' | 'fullUpdate' | 'success' | 'error' | 'keepAlive' | 'validationResult';
}

export type ResponseBody = ModelServerMessage;
export namespace ResponseBody {
    export function asString(body: ResponseBody): string {
        return body.data as string;
    }

    export function asStringArray(body: ResponseBody): string[] {
        return body.data as string[];
    }

    export function asBoolean(body: ResponseBody): boolean {
        return Boolean(asObject(body));
    }

    export function asObject(body: ResponseBody): object {
        return JSON.parse(body.data.toString());
    }

    export function asModelArray(body: ResponseBody): Model[] {
        return Object.entries(body.data).map(ResponseBody.asModel);
    }

    export function asModel(data: [string, string]): Model {
        return { modelUri: data[0], content: data[1] } as Model;
    }

    export function isSuccess(body: ResponseBody): boolean {
        return body.type === 'success';
    }
}

export namespace RequestBody {
    export function fromData(data: any): string {
        return from({ data });
    }

    export function from(object: any): string {
        return JSON.stringify(object);
    }
}

export class Response<T> {
    constructor(
        readonly body: T,
        readonly statusCode: number,
        readonly statusMessage: string
    ) { }

    public mapBody<U>(mapper: (body: T) => U): Response<U> {
        return new Response(mapper(this.body), this.statusCode, this.statusMessage);
    }
}

