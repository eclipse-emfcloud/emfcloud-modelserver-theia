/*********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *********************************************************************************/
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Operation } from 'fast-json-patch';
import WebSocket from 'isomorphic-ws';

import { ModelServerError, ServerConfiguration, SubscriptionOptions } from './model-server-client-api-v1';
import { Format, FORMAT_JSON_V2, ModelServerClientApiV2, ModelUpdateResult } from './model-server-client-api-v2';
import { MessageDataMapper, Model, ModelServerMessage } from './model-server-message';
import { ModelServerPaths } from './model-server-paths';
import { ModelServerCommand } from './model/command-model';
import { Diagnostic } from './model/diagnostic';
import { SubscriptionListener } from './subscription-listener';
import { AnyObject, asObject, asString, asType, encodeRequestBody, TypeGuard } from './utils/type-util';

/**
 * A client to interact with a model server.
 */
export class ModelServerClientV2 implements ModelServerClientApiV2 {
    protected restClient: AxiosInstance;
    protected openSockets: Map<string, WebSocket> = new Map();
    protected _baseUrl: string;
    protected defaultFormat: Format = FORMAT_JSON_V2;

    initialize(baseUrl: string, defaultFormat: Format = FORMAT_JSON_V2): void | Promise<void> {
        this._baseUrl = baseUrl;
        this.defaultFormat = defaultFormat;
        this.restClient = axios.create(this.getAxiosConfig(baseUrl));
    }

    protected getAxiosConfig(baseURL: string): AxiosRequestConfig | undefined {
        return { baseURL };
    }

    get(modeluri: string, format?: Format): Promise<AnyObject>;
    get<M>(modeluri: string, typeGuard: TypeGuard<M>, format?: Format): Promise<M>;
    get<M>(modeluri: string, formatOrGuard?: FormatOrGuard<M>, format?: Format): Promise<AnyObject | M> {
        if (typeof formatOrGuard === 'function') {
            const typeGuard = formatOrGuard;
            return this.process(this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { modeluri, format } }), msg =>
                MessageDataMapper.as(msg, typeGuard)
            );
        }
        format = formatOrGuard ?? this.defaultFormat;
        return this.process(this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { modeluri, format } }), MessageDataMapper.asObject);
    }

    getAll(): Promise<Model[]>;
    getAll<M>(typeGuard: TypeGuard<M>): Promise<Model<M>[]>;
    getAll(format: Format): Promise<Model<string>[]>;
    getAll<M>(formatOrGuard?: FormatOrGuard<M>): Promise<Array<Model | Model<string> | Model<M>>> {
        let modelMapper: (model: Model) => Model<string | AnyObject | M>;
        let format = this.defaultFormat;
        if (!formatOrGuard) {
            modelMapper = (model: Model) => mapModel(model);
        } else if (typeof formatOrGuard === 'string') {
            format = formatOrGuard;
            modelMapper = (model: Model) => mapModel(model, undefined, true);
        } else {
            modelMapper = (model: Model) => mapModel(model, formatOrGuard);
        }
        const messageMapper = (message: ModelServerMessage): Array<Model | Model<string> | Model<M>> =>
            MessageDataMapper.asModelArray(message).map(modelMapper);

        return this.process(this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { format } }), messageMapper);
    }

    getModelUris(): Promise<string[]> {
        return this.process(this.restClient.get(ModelServerPaths.MODEL_URIS), MessageDataMapper.asStringArray);
    }

    getElementById(modeluri: string, elementid: string, format?: Format): Promise<AnyObject>;
    getElementById<M>(modeluri: string, elementid: string, typeGuard: TypeGuard<M>): Promise<M>;
    getElementById<M>(modeluri: string, elementid: string, formatOrGuard?: FormatOrGuard<M>, format?: string): Promise<AnyObject | M> {
        format = format ?? this.defaultFormat;
        if (formatOrGuard) {
            if (typeof formatOrGuard === 'function') {
                const typeGuard = formatOrGuard;
                return this.process(this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri, elementid, format } }), msg =>
                    MessageDataMapper.as(msg, typeGuard)
                );
            }
            format = formatOrGuard;
        }
        return this.process(
            this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri, elementid, format } }),
            MessageDataMapper.asObject
        );
    }

    getElementByName(modeluri: string, elementname: string, format?: Format): Promise<AnyObject>;
    getElementByName<M>(modeluri: string, elementname: string, typeGuard: TypeGuard<M>, format?: Format): Promise<M>;
    getElementByName<M>(modeluri: string, elementname: string, formatOrGuard?: FormatOrGuard<M>, format?: Format): Promise<AnyObject | M> {
        format = format ?? this.defaultFormat;
        if (formatOrGuard) {
            if (typeof formatOrGuard === 'function') {
                const typeGuard = formatOrGuard;
                return this.process(
                    this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri, elementname, format } }),
                    msg => MessageDataMapper.as(msg, typeGuard)
                );
            }
            format = formatOrGuard;
        }
        return this.process(
            this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri, elementname, format } }),
            MessageDataMapper.asObject
        );
    }

    create(modeluri: string, model: AnyObject | string, format?: Format): Promise<AnyObject>;
    create<M>(modeluri: string, model: AnyObject | string, typeGuard: TypeGuard<M>, format?: Format): Promise<M>;
    create<M>(modeluri: string, model: AnyObject | string, formatOrGuard?: FormatOrGuard<M>, format?: Format): Promise<AnyObject | M> {
        format = format ?? this.defaultFormat;
        if (formatOrGuard) {
            if (typeof formatOrGuard === 'function') {
                const typeGuard = formatOrGuard;
                return this.process(
                    this.restClient.post(ModelServerPaths.MODEL_CRUD, encodeRequestBody(format)(model), { params: { modeluri, format } }),
                    msg => MessageDataMapper.as(msg, typeGuard)
                );
            }
            format = formatOrGuard;
        }
        return this.process(
            this.restClient.post(ModelServerPaths.MODEL_CRUD, encodeRequestBody(format)(model), { params: { modeluri, format } }),
            MessageDataMapper.asObject
        );
    }

    update(modeluri: string, model: AnyObject | string, format?: Format): Promise<AnyObject>;
    update<M>(modeluri: string, model: string | string, typeGuard: TypeGuard<M>, format?: Format): Promise<M>;
    update<M>(
        modeluri: string,
        model: AnyObject | string,
        formatOrGuard?: FormatOrGuard<M>,
        format?: Format
    ): Promise<AnyObject> | Promise<M> {
        format = format ?? this.defaultFormat;
        if (formatOrGuard) {
            if (typeof formatOrGuard === 'function') {
                const typeGuard = formatOrGuard;
                return this.process(
                    this.restClient.put(ModelServerPaths.MODEL_CRUD, encodeRequestBody(format)(model), { params: { modeluri, format } }),
                    msg => MessageDataMapper.as(msg, typeGuard)
                );
            }
            format = formatOrGuard;
        }
        return this.process(
            this.restClient.put(ModelServerPaths.MODEL_CRUD, encodeRequestBody(format)(model), { params: { modeluri, format } }),
            MessageDataMapper.asObject
        );
    }

    delete(modeluri: string): Promise<boolean> {
        return this.process(this.restClient.delete(ModelServerPaths.MODEL_CRUD, { params: { modeluri } }), MessageDataMapper.isSuccess);
    }

    close(modeluri: string): Promise<boolean> {
        return this.process(this.restClient.post(ModelServerPaths.CLOSE, undefined, { params: { modeluri } }), MessageDataMapper.isSuccess);
    }

    save(modeluri: string): Promise<boolean> {
        return this.process(this.restClient.get(ModelServerPaths.SAVE, { params: { modeluri } }), MessageDataMapper.isSuccess);
    }

    saveAll(): Promise<boolean> {
        return this.process(this.restClient.get(ModelServerPaths.SAVE_ALL), MessageDataMapper.isSuccess);
    }

    validate(modeluri: string): Promise<Diagnostic> {
        return this.process(this.restClient.get(ModelServerPaths.VALIDATION, { params: { modeluri } }), response =>
            MessageDataMapper.as(response, Diagnostic.is)
        );
    }

    getValidationConstraints(modeluri: string): Promise<string> {
        return this.process(
            this.restClient.get(ModelServerPaths.VALIDATION_CONSTRAINTS, { params: { modeluri } }),
            MessageDataMapper.asString
        );
    }

    getTypeSchema(modeluri: string): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.TYPE_SCHEMA, { params: { modeluri } }), MessageDataMapper.asString);
    }

    getUiSchema(schemaname: string): Promise<string> {
        return this.process(this.restClient.get(ModelServerPaths.UI_SCHEMA, { params: { schemaname } }), MessageDataMapper.asString);
    }

    configureServer(configuration: ServerConfiguration): Promise<boolean> {
        let { workspaceRoot, uiSchemaFolder } = configuration;
        workspaceRoot = workspaceRoot.replace('file://', '');
        uiSchemaFolder = uiSchemaFolder?.replace('file://', '');
        return this.process(
            this.restClient.put(ModelServerPaths.SERVER_CONFIGURE, { workspaceRoot, uiSchemaFolder }),
            MessageDataMapper.isSuccess
        );
    }

    ping(): Promise<boolean> {
        return this.process(this.restClient.get(ModelServerPaths.SERVER_PING), MessageDataMapper.isSuccess);
    }

    edit(modeluri: string, patch: Operation): Promise<ModelUpdateResult>;
    edit(modeluri: string, patch: Operation[]): Promise<ModelUpdateResult>;
    edit(modeluri: string, command: ModelServerCommand): Promise<ModelUpdateResult>;
    edit(modeluri: string, patchOrCommand: Operation | Operation[] | ModelServerCommand): Promise<ModelUpdateResult> {
        let patchMessage: any;
        if (patchOrCommand instanceof ModelServerCommand) {
            patchMessage = {
                type: 'modelserver.emfcommand',
                data: patchOrCommand
            };
        } else {
            const fullPatch = Array.isArray(patchOrCommand) ? patchOrCommand : [patchOrCommand];
            patchMessage = {
                type: 'modelserver.patch',
                data: fullPatch
            };
        }
        return this.process(
            this.restClient.patch(
                ModelServerPaths.MODEL_CRUD,
                encodeRequestBody(this.defaultFormat)(patchMessage),
                { params: { modeluri, format: this.defaultFormat } }
            ),
            MessageDataMapper.patchModel
        );
    }

    undo(modeluri: string): Promise<ModelUpdateResult> {
        return this.process(this.restClient.get(ModelServerPaths.UNDO, { params: { modeluri } }), MessageDataMapper.patchModel);
    }

    redo(modeluri: string): Promise<ModelUpdateResult> {
        return this.process(this.restClient.get(ModelServerPaths.REDO, { params: { modeluri } }), MessageDataMapper.patchModel);
    }

    send(modelUri: string, message: ModelServerMessage): void {
        const openSocket = this.openSockets.get(modelUri);
        if (openSocket) {
            openSocket.send(message);
        }
    }

    subscribe(modeluri: string, listener: SubscriptionListener, options: SubscriptionOptions = {}): SubscriptionListener {
        if (this.isSocketOpen(modeluri)) {
            const errorMsg = `${modeluri} : Cannot open new socket, already subscribed!'`;
            console.warn(errorMsg);
            if (options.errorWhenUnsuccessful) {
                throw new Error('errorMsg');
            }
        }
        const path = this.createSubscriptionPath(modeluri, options);
        this.doSubscribe(listener, modeluri, path);
        return listener;
    }

    unsubscribe(modeluri: string): void {
        const openSocket = this.openSockets.get(modeluri);
        if (openSocket) {
            openSocket.close();
            this.openSockets.delete(modeluri);
        }
    }

    protected createSubscriptionPath(modeluri: string, options: SubscriptionOptions): string {
        const queryParams = new URLSearchParams();
        queryParams.append('modeluri', modeluri);
        if (!options.format) {
            options.format = this.defaultFormat;
        }
        Object.entries(options).forEach(entry => queryParams.append(entry[0], entry[1]));
        queryParams.delete('errorWhenUnsuccessful');
        return `${this._baseUrl}/${ModelServerPaths.SUBSCRIPTION}?${queryParams.toString()}`.replace(/^(http|https):\/\//i, 'ws://');
    }

    protected doSubscribe(listener: SubscriptionListener, modelUri: string, path: string): void {
        const socket = new WebSocket(path.trim());
        socket.onopen = event => listener.onOpen?.(modelUri, event);
        socket.onclose = event => listener.onClose?.(modelUri, event);
        socket.onerror = event => listener.onError?.(modelUri, event);
        socket.onmessage = event => listener.onMessage?.(modelUri, event);
        this.openSockets.set(modelUri, socket);
    }

    protected isSocketOpen(modelUri: string): boolean {
        return this.openSockets.get(modelUri) !== undefined;
    }

    protected async process<T>(request: Promise<AxiosResponse<ModelServerMessage>>, mapper: MessageDataMapper<T>): Promise<T> {
        try {
            const response = await request;
            if (response.data.type === 'error') {
                throw new ModelServerError(response.data);
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
type FormatOrGuard<M> = Format | TypeGuard<M>;

function mapModel<M>(model: Model, guard?: TypeGuard<M>, toString = false): Model<AnyObject | M | string> {
    const { modelUri, content } = model;
    if (guard) {
        return { modelUri, content: asType(content, guard) };
    } else if (toString) {
        return { modelUri, content: asString(content) };
    }
    return { modelUri, content: asObject(content) };
}
