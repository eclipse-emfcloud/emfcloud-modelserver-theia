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
import { JsonRpcServer } from '@theia/core/lib/common/messaging';

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

export interface ModelServerMessage {
    type: 'dirtyState' | 'incrementalUpdate' | 'fullUpdate' | 'success' | 'error';
    data: any;
}
export const ModelServerFrontendClient = Symbol('ModelServerFrontendClient');
export interface ModelServerFrontendClient {
    onOpen(): void;

    onMessage(message: ModelServerMessage): void;

    onClosed(code: number, reason: string): void;

    onError(error: Error): void;
}

export interface Model {
    modelUri: string;
    content: string;
}

export const ModelServerClient = Symbol('ModelServerClient');
export interface ModelServerClient
    extends JsonRpcServer<ModelServerFrontendClient> {
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
    save(modelUri: string): Promise<Response<boolean>>;

    getLaunchOptions(): Promise<LaunchOptions>;
    // subscribe
    subscribe(modelUri: string): void;
    unsubscribe(modelUri: string): void;

    edit(modelUri: string, command: ModelServerCommand): Promise<Response<boolean>>;

    getTypeSchema(modelUri: string): Promise<Response<string>>;
    getUiSchema(schemaName: string): Promise<Response<string>>;
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

