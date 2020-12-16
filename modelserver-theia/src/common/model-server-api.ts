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
import { JsonRpcServer } from '@theia/core';
import * as WebSocket from 'ws';

export const MODEL_SERVER_CLIENT_SERVICE_PATH = '/services/modelserverclient';

export type DataValueType = boolean | number | string;

export interface ModelServerObject {
    eClass: string;
}

export interface ModelServerReferenceDescription extends ModelServerObject {
    $ref: string;
}

export interface ModelServerCommand {
    eClass: 'http://www.eclipsesource.com/schema/2019/modelserver/command#//Command';
    type: 'compound' | 'add' | 'remove' | 'set' | 'replace' | 'move';
    owner: ModelServerReferenceDescription;
    feature: string;
    indices?: number[];
    dataValues?: DataValueType[];
    objectValues?: ModelServerReferenceDescription[];
    objectsToAdd?: ModelServerObject[];
    commands?: ModelServerCommand[];
}

export interface WebSocketEvent {
    target: WebSocket;
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

export const ModelServerSubscriptionClient = Symbol('ModelServerSubscriptionClient');
export interface ModelServerSubscriptionClient {
    fireOpenEvent(event: WebSocketEvent, modelUri: string): void;
    fireMessageEvent(event: WebSocketMessageEvent, modelUri: string): void;
    fireClosedEvent(event: WebSocketCloseEvent, modelUri: string): void;
    fireErrorEvent(event: WebSocketErrorEvent, modelUri: string): void;
    fireUserWarning(warning: string, modelUri: string): void;
}

export const ModelServerSubscriptionListener = Symbol('ModelServerSubscriptionListener');
export interface ModelServerSubscriptionListener {
    onOpened(modelUri: string): void;
    onClosed(modelUri: string, reason: string): void;
    onWarning(modelUri: string, warning: string): void;
    onError(modelUri: string, error: any): void;
    onDirtyState(modelUri: string, dirtyState: boolean): void;
    onIncrementalUpdate(modelUri: string, incrementalUpdate: object): void;
    onFullUpdate(modelUri: string, fullUpdate: object): void;
    onSuccess(modelUri: string, successMessage: string): void;
    onUnknownMessage(modelUri: string, message: string): void;
}

export const ModelServerClient = Symbol('ModelServerClient');
export interface ModelServerClient extends JsonRpcServer<ModelServerSubscriptionClient> {
    initialize(): Promise<boolean>;

    get(modelUri: string): Promise<Response<string>>;
    getAll(): Promise<Response<Model[]>>;
    getModelUris(): Promise<Response<string[]>>;

    getElementById(modelUri: string, elementid: string): Promise<Response<string>>;
    getElementByName(modelUri: string, elementname: string): Promise<Response<string>>;

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

    // WebSocket connection
    subscribe(modelUri: string): void;
    subscribeWithTimeout(modelUri: string, timeout: number): void;
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

export interface ModelServerMessage {
    type: 'dirtyState' | 'incrementalUpdate' | 'fullUpdate' | 'success' | 'error' | 'keepAlive';
    data: any;
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

