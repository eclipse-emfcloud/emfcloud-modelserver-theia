/********************************************************************************
 * Copyright (c) 2021-2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import WebSocket from 'isomorphic-ws';
import URI from 'urijs';

import { ModelServerClientApiV1, ModelServerError, ServerConfiguration, SubscriptionOptions } from './model-server-client-api-v1';
import { IdentityMapper, Mapper, MessageDataMapper, Model, ModelServerMessage } from './model-server-message';
import { ModelServerPaths } from './model-server-paths';
import { ModelServerCommand } from './model/command-model';
import { Diagnostic } from './model/diagnostic';
import { SubscriptionListener } from './subscription-listener';
import { AnyObject, asObject, asString, asType, TypeGuard } from './utils/type-util';

/**
 * A client to interact with a model server.
 */
export class ModelServerClient implements ModelServerClientApiV1 {
    protected restClient: AxiosInstance;
    protected openSockets: Map<string, WebSocket> = new Map();
    protected _baseUrl: URI;
    protected defaultFormat = 'json';

    initialize(baseUrl: URI): void | Promise<void> {
        this._baseUrl = baseUrl.clone();
        this.restClient = axios.create(this.getAxisConfig(baseUrl));
    }

    protected getAxisConfig(baseURL: URI): AxiosRequestConfig | undefined {
        return { baseURL: baseURL.toString() };
    }

    get(modeluri: URI): Promise<AnyObject>;
    get<M>(modeluri: URI, typeGuard: TypeGuard<M>): Promise<M>;
    get(modeluri: URI, format: string): Promise<string>;
    get<M>(modeluri: URI, formatOrGuard?: FormatOrGuard<M>): Promise<AnyObject | M | string> {
        const format = typeof formatOrGuard === 'string' ? formatOrGuard : this.defaultFormat;
        const mapper = createMapper<M>(formatOrGuard);
        return this.process(this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { modeluri, format } }), mapper);
    }

    getAll(): Promise<Model[]>;
    getAll<M>(typeGuard: TypeGuard<M>): Promise<Model<M>[]>;
    getAll(format: string): Promise<Model<string>[]>;
    getAll<M>(formatOrGuard?: FormatOrGuard<M>): Promise<Array<Model | Model<string> | Model<M>>> {
        let modelMapper: (model: Model) => Model<string | AnyObject | M>;
        let format = 'json';
        if (typeof formatOrGuard === 'string') {
            format = formatOrGuard;
            modelMapper = (model: Model) => mapModel(model, undefined, true);
        } else if (typeof formatOrGuard === 'function') {
            modelMapper = (model: Model) => mapModel(model, formatOrGuard);
        } else {
            modelMapper = (model: Model) => mapModel(model);
        }

        const messageMapper = (message: ModelServerMessage): Array<Model | Model<string> | Model<M>> =>
            MessageDataMapper.asModelArray(message).map(modelMapper);

        return this.process(this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { format } }), messageMapper);
    }

    getModelUris(): Promise<URI[]> {
        return this.process(this.restClient.get(ModelServerPaths.MODEL_URIS), MessageDataMapper.asURIArray);
    }

    getElementById(modeluri: URI, elementid: string): Promise<AnyObject>;
    getElementById<M>(modeluri: URI, elementid: string, typeGuard: TypeGuard<M>): Promise<M>;
    getElementById(modeluri: URI, elementid: string, format: string): Promise<string>;
    getElementById<M>(modeluri: URI, elementid: string, formatOrGuard?: FormatOrGuard<M>): Promise<AnyObject | M | string> {
        const format = typeof formatOrGuard === 'string' ? formatOrGuard : this.defaultFormat;
        const mapper = createMapper<M>(formatOrGuard);
        return this.process(this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri, elementid, format } }), mapper);
    }

    getElementByName(modeluri: URI, elementname: string): Promise<AnyObject>;
    getElementByName<M>(modeluri: URI, elementname: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;
    getElementByName(modeluri: URI, elementname: string, format: string): Promise<string>;
    getElementByName<M>(modeluri: URI, elementname: string, formatOrGuard?: FormatOrGuard<M>): Promise<AnyObject | M | string> {
        const format = typeof formatOrGuard === 'string' ? formatOrGuard : this.defaultFormat;
        const mapper = createMapper<M>(formatOrGuard);
        return this.process(this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri, elementname, format } }), mapper);
    }

    create(modeluri: URI, model: AnyObject | string): Promise<AnyObject>;
    create(modeluri: URI, model: AnyObject | string, format: string): Promise<string>;
    create<M>(modeluri: URI, model: AnyObject | string, typeGuard: TypeGuard<M>): Promise<M>;
    create<M>(modeluri: URI, model: AnyObject | string, formatOrGuard?: FormatOrGuard<M>): Promise<AnyObject | M | string> {
        const format = typeof formatOrGuard === 'string' ? formatOrGuard : this.defaultFormat;
        const mapper = createMapper<M>(formatOrGuard);
        return this.process(this.restClient.post(ModelServerPaths.MODEL_CRUD, { data: model }, { params: { modeluri, format } }), mapper);
    }

    update(modeluri: URI, model: AnyObject | string): Promise<AnyObject>;
    update<M>(modeluri: URI, model: string | string, typeGuard: TypeGuard<M>): Promise<M>;
    update(modeluri: URI, model: AnyObject | string, format: string): Promise<AnyObject>;
    update<M>(modeluri: URI, model: AnyObject | string, formatOrGuard?: FormatOrGuard<M>): Promise<AnyObject | M | string> {
        const format = typeof formatOrGuard === 'string' ? formatOrGuard : this.defaultFormat;
        const mapper = createMapper<M>(formatOrGuard);
        return this.process(this.restClient.patch(ModelServerPaths.MODEL_CRUD, { data: model }, { params: { modeluri, format } }), mapper);
    }

    delete(modeluri: URI): Promise<boolean> {
        return this.process(this.restClient.delete(ModelServerPaths.MODEL_CRUD, { params: { modeluri } }), MessageDataMapper.isSuccess);
    }

    close(modeluri: URI): Promise<boolean> {
        return this.process(this.restClient.post(ModelServerPaths.CLOSE, undefined, { params: { modeluri } }), MessageDataMapper.isSuccess);
    }

    save(modeluri: URI): Promise<boolean> {
        return this.process(this.restClient.get(ModelServerPaths.SAVE, { params: { modeluri } }), MessageDataMapper.isSuccess);
    }

    saveAll(): Promise<boolean> {
        return this.process(this.restClient.get(ModelServerPaths.SAVE_ALL), MessageDataMapper.isSuccess);
    }

    validate(modeluri: URI): Promise<Diagnostic> {
        return this.process(this.restClient.get(ModelServerPaths.VALIDATION, { params: { modeluri } }), response =>
            MessageDataMapper.as(response, Diagnostic.is)
        );
    }

    getValidationConstraints(modeluri: URI): Promise<string> {
        return this.process(
            this.restClient.get(ModelServerPaths.VALIDATION_CONSTRAINTS, { params: { modeluri } }),
            MessageDataMapper.asString
        );
    }

    getTypeSchema(modeluri: URI): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.TYPE_SCHEMA, { params: { modeluri } }), MessageDataMapper.asString);
    }

    getUiSchema(schemaname: string): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.UI_SCHEMA, { params: { schemaname } }), MessageDataMapper.asString);
    }

    configureServer(configuration: ServerConfiguration): Promise<boolean> {
        return this.process(
            this.restClient.put(ModelServerPaths.SERVER_CONFIGURE, {
                workspaceRoot: configuration.workspaceRoot.toString(),
                uiSchemaFolder: configuration.uiSchemaFolder?.toString()
            }),
            MessageDataMapper.isSuccess
        );
    }

    ping(): Promise<boolean> {
        return this.process(this.restClient.get(ModelServerPaths.SERVER_PING), MessageDataMapper.isSuccess);
    }

    edit(modeluri: URI, command: ModelServerCommand): Promise<boolean> {
        return this.process(
            this.restClient.patch(ModelServerPaths.EDIT, { data: command }, { params: { modeluri, format: this.defaultFormat } }),
            MessageDataMapper.isSuccess
        );
    }

    undo(modeluri: URI): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.UNDO, { params: { modeluri } }), MessageDataMapper.asString);
    }

    redo(modeluri: URI): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.REDO, { params: { modeluri } }), MessageDataMapper.asString);
    }

    send(modeluri: URI, message: ModelServerMessage): boolean {
        const openSocket = this.openSockets.get(modeluri.toString());
        if (openSocket) {
            openSocket.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    subscribe(modeluri: URI, options: SubscriptionOptions = {}): void {
        if (!options.listener) {
            const errorMsg = `${modeluri.toString()} : Cannot subscribe. No listener is present!'`;
            throw new Error(errorMsg);
        }
        if (this.isSocketOpen(modeluri)) {
            const errorMsg = `${modeluri.toString()} : Cannot open new socket, already subscribed!'`;
            console.warn(errorMsg);
            if (options.errorWhenUnsuccessful) {
                throw new Error(errorMsg);
            }
        }
        const path = this.createSubscriptionPath(modeluri, options);
        this.doSubscribe(options.listener, modeluri, path);
    }

    unsubscribe(modeluri: URI): boolean {
        const openSocket = this.openSockets.get(modeluri.toString());
        if (openSocket) {
            openSocket.close();
            this.openSockets.delete(modeluri.toString());
            return true;
        }
        return false;
    }

    protected createSubscriptionPath(modeluri: URI, options: SubscriptionOptions): URI {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { listener, ...paramOptions } = options;
        const subscriptionUri = this._baseUrl.clone();
        subscriptionUri.protocol('ws');
        subscriptionUri.segment(ModelServerPaths.SUBSCRIPTION);
        subscriptionUri.addQuery('modeluri', modeluri);
        subscriptionUri.addQuery('format', options.format || this.defaultFormat);
        Object.entries(paramOptions).forEach(entry => subscriptionUri.addQuery(entry[0], entry[1]));
        subscriptionUri.removeQuery('errorWhenUnsuccessful');
        return subscriptionUri;
    }

    protected doSubscribe(listener: SubscriptionListener, modeluri: URI, path: URI): void {
        const socket = new WebSocket(path.toString() /* .trim() */);
        socket.onopen = event => listener.onOpen(modeluri, event);
        socket.onclose = event => {
            listener.onClose(modeluri, event);
            this.openSockets.delete(modeluri.toString());
        };

        socket.onerror = event => listener.onError(modeluri, event);
        socket.onmessage = event => listener.onMessage(modeluri, event);
        this.openSockets.set(modeluri.toString(), socket);
    }

    protected isSocketOpen(modeluri: URI): boolean {
        return this.openSockets.get(modeluri.toString()) !== undefined;
    }

    protected async process<T>(request: Promise<AxiosResponse<ModelServerMessage>>, mapper: MessageDataMapper<T>): Promise<T> {
        const errorResponse = (data: ModelServerMessage): ModelServerError | undefined => {
            if (data.type === 'error') {
                return new ModelServerError(data);
            }
            return undefined;
        };
        return this.processGeneric<ModelServerMessage, T>(request, mapper, errorResponse);
    }

    protected async processMessageAsData<M>(request: Promise<AxiosResponse<M>>): Promise<M> {
        return this.processGeneric<M, M>(request, IdentityMapper, () => undefined);
    }

    protected async processGeneric<M, T>(
        request: Promise<AxiosResponse<M>>,
        mapper: Mapper<M, T>,
        erroResponse: (message: M) => ModelServerError | undefined
    ): Promise<T> {
        try {
            const response = await request;
            const modelServerError = erroResponse(response.data);
            if (modelServerError) {
                throw modelServerError;
            }
            return mapper(response.data);
        } catch (error) {
            if (isAxiosError(error)) {
                const message = error.response?.data ? error.response.data : error.message;
                throw new ModelServerError(message, error.code);
            } else {
                throw error;
            }
        }
    }
}

function isAxiosError(error: any): error is AxiosError {
    return error !== undefined && error instanceof Error && 'isAxiosError' in error && error['isAxiosError'];
}

/**
 * Helper type for method overloads where on parameter could either be
 * a 'format' string or a typeguard to cast the response to a concrete type.
 */
type FormatOrGuard<M> = string | TypeGuard<M>;

/**
 * Creates a modelserver message data mapper that maps the response either to a generic JSON object, a specific typed object or string.
 * The actual mapper is derived from the input parameters.
 * @param guard
 * @param toString
 */
function createMapper<M>(formatOrGuard?: FormatOrGuard<M>): MessageDataMapper<AnyObject | M | string> {
    if (typeof formatOrGuard === 'string') {
        return msg => MessageDataMapper.asString(msg);
    } else if (typeof formatOrGuard === 'function') {
        const typeGuard = formatOrGuard;
        return msg => MessageDataMapper.as(msg, typeGuard);
    }
    return msg => MessageDataMapper.asObject(msg);
}

function mapModel<M>(model: Model, guard?: TypeGuard<M>, toString = false): Model<AnyObject | M | string> {
    const { modeluri, content } = model;
    if (guard) {
        return { modeluri, content: asType(content, guard) };
    } else if (toString) {
        return { modeluri, content: asString(content) };
    }
    return { modeluri, content: asObject(content) };
}
