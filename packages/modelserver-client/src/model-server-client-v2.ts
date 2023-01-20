/********************************************************************************
 * Copyright (c) 2022-2023 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { deepClone } from 'fast-json-patch';
import WebSocket from 'isomorphic-ws';
import URI from 'urijs';

import { ModelServerError, ServerConfiguration, SubscriptionOptions } from './model-server-client-api-v1';
import { Format, FORMAT_JSON_V2, ModelServerClientApiV2, ModelUpdateResult, PatchOrCommand } from './model-server-client-api-v2';
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
    protected _baseUrl: URI;
    protected defaultFormat: Format = FORMAT_JSON_V2;

    initialize(baseUrl: URI, defaultFormat: Format = FORMAT_JSON_V2): void | Promise<void> {
        this._baseUrl = baseUrl.clone();
        this.defaultFormat = defaultFormat;
        this.restClient = axios.create(this.getAxiosConfig(baseUrl));
    }

    protected getAxiosConfig(baseURL: URI): AxiosRequestConfig | undefined {
        return { baseURL: baseURL.toString() };
    }

    get(modeluri: URI, format?: Format): Promise<AnyObject>;
    get<M>(modeluri: URI, typeGuard: TypeGuard<M>, format?: Format): Promise<M>;
    get<M>(modeluri: URI, formatOrGuard?: FormatOrGuard<M>, format?: Format): Promise<AnyObject | M> {
        if (typeof formatOrGuard === 'function') {
            const typeGuard = formatOrGuard;
            return this.process(
                this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { modeluri: modeluri.toString(), format } }),
                msg => MessageDataMapper.as(msg, typeGuard)
            );
        }
        format = formatOrGuard ?? this.defaultFormat;
        return this.process(
            this.restClient.get(ModelServerPaths.MODEL_CRUD, { params: { modeluri: modeluri.toString(), format } }),
            MessageDataMapper.asObject
        );
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

    getModelUris(): Promise<URI[]> {
        return this.process(this.restClient.get(ModelServerPaths.MODEL_URIS), MessageDataMapper.asURIArray);
    }

    getElementById(modeluri: URI, elementid: string, format?: Format): Promise<AnyObject>;
    getElementById<M>(modeluri: URI, elementid: string, typeGuard: TypeGuard<M>): Promise<M>;
    getElementById<M>(modeluri: URI, elementid: string, formatOrGuard?: FormatOrGuard<M>, format?: string): Promise<AnyObject | M> {
        format = format ?? this.defaultFormat;
        if (formatOrGuard) {
            if (typeof formatOrGuard === 'function') {
                const typeGuard = formatOrGuard;
                return this.process(
                    this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri: modeluri.toString(), elementid, format } }),
                    msg => MessageDataMapper.as(msg, typeGuard)
                );
            }
            format = formatOrGuard;
        }
        return this.process(
            this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri: modeluri.toString(), elementid, format } }),
            MessageDataMapper.asObject
        );
    }

    getElementByName(modeluri: URI, elementname: string, format?: Format): Promise<AnyObject>;
    getElementByName<M>(modeluri: URI, elementname: string, typeGuard: TypeGuard<M>, format?: Format): Promise<M>;
    getElementByName<M>(modeluri: URI, elementname: string, formatOrGuard?: FormatOrGuard<M>, format?: Format): Promise<AnyObject | M> {
        format = format ?? this.defaultFormat;
        if (formatOrGuard) {
            if (typeof formatOrGuard === 'function') {
                const typeGuard = formatOrGuard;
                return this.process(
                    this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri: modeluri.toString(), elementname, format } }),
                    msg => MessageDataMapper.as(msg, typeGuard)
                );
            }
            format = formatOrGuard;
        }
        return this.process(
            this.restClient.get(ModelServerPaths.MODEL_ELEMENT, { params: { modeluri: modeluri.toString(), elementname, format } }),
            MessageDataMapper.asObject
        );
    }

    create(modeluri: URI, model: AnyObject | string, format?: Format): Promise<AnyObject>;
    create<M>(modeluri: URI, model: AnyObject | string, typeGuard: TypeGuard<M>, format?: Format): Promise<M>;
    create<M>(modeluri: URI, model: AnyObject | string, formatOrGuard?: FormatOrGuard<M>, format?: Format): Promise<AnyObject | M> {
        format = format ?? this.defaultFormat;
        if (formatOrGuard) {
            if (typeof formatOrGuard === 'function') {
                const typeGuard = formatOrGuard;
                return this.process(
                    this.restClient.post(ModelServerPaths.MODEL_CRUD, encodeRequestBody(format)(model), {
                        params: { modeluri: modeluri.toString(), format }
                    }),
                    msg => MessageDataMapper.as(msg, typeGuard)
                );
            }
            format = formatOrGuard;
        }
        return this.process(
            this.restClient.post(ModelServerPaths.MODEL_CRUD, encodeRequestBody(format)(model), {
                params: { modeluri: modeluri.toString(), format }
            }),
            MessageDataMapper.asObject
        );
    }

    update(modeluri: URI, model: AnyObject | string, format?: Format): Promise<AnyObject>;
    update<M>(modeluri: URI, model: string | string, typeGuard: TypeGuard<M>, format?: Format): Promise<M>;
    update<M>(
        modeluri: URI,
        model: AnyObject | string,
        formatOrGuard?: FormatOrGuard<M>,
        format?: Format
    ): Promise<AnyObject> | Promise<M> {
        format = format ?? this.defaultFormat;
        if (formatOrGuard) {
            if (typeof formatOrGuard === 'function') {
                const typeGuard = formatOrGuard;
                return this.process(
                    this.restClient.put(ModelServerPaths.MODEL_CRUD, encodeRequestBody(format)(model), {
                        params: { modeluri: modeluri.toString(), format }
                    }),
                    msg => MessageDataMapper.as(msg, typeGuard)
                );
            }
            format = formatOrGuard;
        }
        return this.process(
            this.restClient.put(ModelServerPaths.MODEL_CRUD, encodeRequestBody(format)(model), {
                params: { modeluri: modeluri.toString(), format }
            }),
            MessageDataMapper.asObject
        );
    }

    delete(modeluri: URI): Promise<boolean> {
        return this.process(
            this.restClient.delete(ModelServerPaths.MODEL_CRUD, { params: { modeluri: modeluri.toString() } }),
            MessageDataMapper.isSuccess
        );
    }

    close(modeluri: URI): Promise<boolean> {
        return this.process(
            this.restClient.post(ModelServerPaths.CLOSE, undefined, { params: { modeluri: modeluri.toString() } }),
            MessageDataMapper.isSuccess
        );
    }

    save(modeluri: URI): Promise<boolean> {
        return this.process(
            this.restClient.get(ModelServerPaths.SAVE, { params: { modeluri: modeluri.toString() } }),
            MessageDataMapper.isSuccess
        );
    }

    saveAll(): Promise<boolean> {
        return this.process(this.restClient.get(ModelServerPaths.SAVE_ALL), MessageDataMapper.isSuccess);
    }

    validate(modeluri: URI): Promise<Diagnostic> {
        return this.process(this.restClient.get(ModelServerPaths.VALIDATION, { params: { modeluri: modeluri.toString() } }), response =>
            MessageDataMapper.as(response, Diagnostic.is)
        );
    }

    getValidationConstraints(modeluri: URI): Promise<string> {
        return this.process(
            this.restClient.get(ModelServerPaths.VALIDATION_CONSTRAINTS, { params: { modeluri: modeluri.toString() } }),
            MessageDataMapper.asString
        );
    }

    getTypeSchema(modeluri: URI): Promise<string> {
        return this.process(
            this.restClient.get(ModelServerPaths.TYPE_SCHEMA, { params: { modeluri: modeluri.toString() } }),
            MessageDataMapper.asString
        );
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

    edit(modeluri: URI, patchOrCommand: PatchOrCommand, format = this.defaultFormat): Promise<ModelUpdateResult> {
        let patchMessage: any;
        if (patchOrCommand instanceof ModelServerCommand) {
            patchMessage = {
                type: 'modelserver.emfcommand',
                data: patchOrCommand
            };
        } else {
            // Operation[] and ModelPatch[] are treated in the same way; we don't need to distinguish both cases
            const fullPatch = Array.isArray(patchOrCommand) ? patchOrCommand : [patchOrCommand];
            patchMessage = {
                type: 'modelserver.patch',
                data: fullPatch
            };
            if (fullPatch.length === 0) {
                // No-op
                return Promise.resolve({
                    success: true,
                    patchModel: (oldModel, copy, _modeluri) => (copy ? deepClone(oldModel) : oldModel),
                    patch: []
                });
            }
        }
        return this.process(
            this.restClient.patch(ModelServerPaths.MODEL_CRUD, encodeRequestBody(format)(patchMessage), {
                params: { modeluri: modeluri.toString(), format: format }
            }),
            MessageDataMapper.patchModel
        );
    }

    undo(modeluri: URI): Promise<ModelUpdateResult> {
        return this.process(
            this.restClient.get(ModelServerPaths.UNDO, { params: { modeluri: modeluri.toString() } }),
            MessageDataMapper.patchModel
        );
    }

    redo(modeluri: URI): Promise<ModelUpdateResult> {
        return this.process(
            this.restClient.get(ModelServerPaths.REDO, { params: { modeluri: modeluri.toString() } }),
            MessageDataMapper.patchModel
        );
    }

    send(modeluri: URI, message: ModelServerMessage): void {
        const openSocket = this.openSockets.get(modeluri.toString());
        if (openSocket) {
            openSocket.send(JSON.stringify(message));
        }
    }

    subscribe(modeluri: URI, listener: SubscriptionListener, options: SubscriptionOptions = {}): SubscriptionListener {
        if (this.isSocketOpen(modeluri)) {
            const errorMsg = `${modeluri.toString()} : Cannot open new socket, already subscribed!'`;
            console.warn(errorMsg);
            if (options.errorWhenUnsuccessful) {
                throw new Error(errorMsg);
            }
        }
        const path = this.createSubscriptionPath(modeluri, options);
        this.doSubscribe(listener, modeluri, path);
        return listener;
    }

    unsubscribe(modeluri: URI): void {
        const openSocket = this.openSockets.get(modeluri.toString());
        if (openSocket) {
            openSocket.close();
            this.openSockets.delete(modeluri.toString());
        }
    }

    protected createSubscriptionPath(modeluri: URI, options: SubscriptionOptions): URI {
        const { ...paramOptions } = options;
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
        socket.onopen = event => listener.onOpen?.(modeluri, event);
        socket.onclose = event => listener.onClose?.(modeluri, event);
        socket.onerror = event => listener.onError?.(modeluri, event);
        socket.onmessage = event => listener.onMessage?.(modeluri, event);
        this.openSockets.set(modeluri.toString(), socket);
    }

    protected isSocketOpen(modeluri: URI): boolean {
        return this.openSockets.get(modeluri.toString()) !== undefined;
    }

    protected async process<T>(request: Promise<AxiosResponse<ModelServerMessage>>, mapper: MessageDataMapper<T>): Promise<T> {
        try {
            const response = await request;
            if (response.data.type === 'error') {
                throw new ModelServerError(response.data);
            }
            return mapper(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data ? error.response.data : error.message;
                throw new ModelServerError(message, error.code);
            } else {
                throw error;
            }
        }
    }
}

/**
 * Helper type for method overloads where on parameter could either be
 * a 'format' string or a typeguard to cast the response to a concrete type.
 */
type FormatOrGuard<M> = Format | TypeGuard<M>;

function mapModel<M>(model: Model, guard?: TypeGuard<M>, toString = false): Model<AnyObject | M | string> {
    const { modeluri, content } = model;
    if (guard) {
        return { modeluri, content: asType(content, guard) };
    } else if (toString) {
        return { modeluri, content: asString(content) };
    }
    return { modeluri, content: asObject(content) };
}
