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
import { MessageDataMapper, Model, ModelServerMessage } from './model-server-message';
import { ModelServerCommand } from './model/command-model';
import { Diagnostic } from './model/diagnostic';
import { SubscriptionListener } from './subscription-listener';
import { AnyObject, TypeGuard } from './utils/type-util';

/**
 * Basic client API to interact with a model server that conforms to the Modelserver API Version 1
 */
export interface ModelServerClientApiV1 {
    /**
     * The `initialize` method should be executed before any other requests to the model server.
     * The given base url should point to the location of the model server API entry point.
     * (e.g. `http://localhost:8081/api/v1/`). Once the initialization is completed the client is expected
     * to be ready and should be able to handle REST requests to & responses from the model server.
     * Any requests to the model server before the client has been initialized are expected to fail (i.e. throw an error)
     * @param baseUrl Url pointing to the API entry point
     * @param defaultFormat Optional fallback format that should used when a request method is invoked and no explicit format argument
     *                      has been passed.
     */
    initialize(baseUrl: string, defaultFormat?: string): void | Promise<void>;

    /**
     * Retrieves all available {@link Model}s of the current workspace as plain JSON objects.
     * @returns An array of all available models.
     */
    getAll(): Promise<Model[]>;
    /**
     * Retrieves all available {@link Model}s of the current workspace as typed JSON objects using
     * a given typeguard.
     * @param typeGuard A guard function to check if the received model is of the expected type.
     * @returns An array of all available models.
     */
    getAll<M>(typeGuard: TypeGuard<M>): Promise<Model<M>[]>;
    /**
     * Retrieves all available {@link Model}s of the current workspace in string representation derived f
     * rom a given format (e.g. 'xml' or 'json').
     * @param format The desired format.
     * @returns A string array of all available models.
     */
    getAll(format: string): Promise<Model<string>[]>;

    /**
     * Retrieves the {@link Model} for given URI as plain JSON object.
     * The result promise is rejected if no matching model for the URI could be retrieved.
     * @param modeluri The URI of the model that should be retrieved
     * @returns The model typed as plain JSON object.
     */
    get(modeluri: string,): Promise<AnyObject>;
    /**
     * Retrieves the {@link Model} for a given URI as typed JSON object
     * The result promise is rejected if no matching model for the URI could be retrieved, or
     * if the model didn't pass the typeguard check.
     * @param modeluri The URI of the model that should be retrieved.
     * @param typeGuard A guard function to check if the received model is of the expected type.
     * @returns The model casted to the given type.
     */
    get<M>(modeluri: string, typeGuard: TypeGuard<M>,): Promise<M>;
    /**
     * Retrieves the {@link Model} for a given URI in string representation derived from a given format (e.g. 'xml' or 'json').
     * The result promise is rejected if no matching model for the URI could be retrieved.
     * @param modeluri The URI of the model that should be retrieved.
     * @param format The desired format.
     * @returns The model in string representation.
     */
    get(modeluri: string, format: string): Promise<string>;

    /**
     * Retrieves the URIs of all available {@link Model}s of the current workspace.
     * @returns A string array of all available model URIs.
     */
    getModelUris(): Promise<string[]>;

    /**
     * Retrieves a specific model (sub)element by its `id` as plain JSON object.
     * The result promise is rejected if no matching model element for the given URI and `id` could be retrieved.
     * @param modeluri The URI of the root model from which the element should be retrieved.
     * @param elementid The `id` of the element that should be retrieved.
     * @returns The model element typed as plain JSON object.
     */
    getElementById(modeluri: string, elementid: string): Promise<AnyObject>;
    /**
     * Retrieves a specific model (sub)element by its `id` as typed JSON object.
     * The result promise is rejected if no matching model element for the given URI and `id` could be retrieved, or
     * if the model didn't pass the typeguard check.
     * @param modeluri The URI of the root model from which the element should be retrieved.
     * @param elementid The `id` of the element that should be retrieved.
     * @param typeGuard A guard function to check if the received model element is of the expected type.
     * @returns The model element casted to the given type.
     */
    getElementById<M>(modeluri: string, elementid: string, typeGuard: TypeGuard<M>): Promise<M>;
    /**
     * Retrieves a specific model (sub)element by its `id` in string representation derived from a given format (e.g. 'xml' or 'json').
     * The result promise is rejected if no matching model element for the given URI and `id` could be retrieved.
     * @param modeluri The URI of the root model from which the element should be retrieved.
     * @param elementid The `id` of the element that should be retrieved.
     * @param format The desired format.
     * @returns The model element in string representation.
     */
    getElementById(modeluri: string, elementid: string, format: string): Promise<string>;

    /**
     * Retrieves a specific model (sub)element by its `name` as plain JSON object.
     * The result promise is rejected if no matching model element for the given URI and `name` could be retrieved.
     * @param modeluri The URI of the root model from which the element should be retrieved.
     * @param elementname The `name` of the element that should be retrieved.
     * @returns The model element typed as plain JSON object.
     */
    getElementByName(modeluri: string, elementname: string): Promise<AnyObject>;
    /**
     * Retrieves a specific model (sub)element by its `name` as typed JSON object.
     * The result promise is rejected if no matching model element for the given URI and `name` could be retrieved, or
     * if the model didn't pass the typeguard check.
     * @param modeluri The URI of the root model from which the element should be retrieved.
     * @param elementname The `name` of the element that should be retrieved.
     * @param typeGuard A guard function to check if the received model element is of the expected type.
     * @returns The model element casted to the given type.
     */
    getElementByName<M>(modeluri: string, elementname: string, typeGuard: TypeGuard<M>, format?: string): Promise<M>;
    /**
     * Retrieves a specific model (sub)element by its `name` in string representation derived from a given format (e.g. 'xml' or 'json').
     * The result promise is rejected if no matching model element for the given URI and `name` could be retrieved.
     * @param modeluri The URI of the root model from which the element should be retrieved.
     * @param elementname The `name` of the element that should be retrieved.
     * @param format The desired format.
     * @returns The model element in string representation.
     */
    getElementByName(modeluri: string, elementname: string, format: string): Promise<string>;

    /**
     * Deletes the {@link Model} with the given URI from the current workspace.
     * @param modeluri The URI of the model that should be deleted.
     * @returns A boolean value indicating whether the deletion was successful.
     */
    delete(modeluri: string): Promise<boolean>;

    /**
     * Closes (i.e. unloads) the model with the given URI from the current workspace. This discards all dirty changes.
     * @param modeluri The URI of the model that should be closed.
     * @returns A boolean value indicating whether the close operation was successful.
     */
    close(modeluri: string): Promise<boolean>;

    /**
     * Creates a new model object with the given URI and content object in the current workspace.
     * @param modeluri The URI of the model that should be created.
     * @param model The content of the new model object either as plain JSON object or string.
     * @returns The newly created model as plain JSON object.
     */
    create(modeluri: string, model: AnyObject | string): Promise<AnyObject>;
    /**
     * Creates a new model object with the given URI and content object in the current workspace.
     * The return type is derived from the given typeguard. The result promise is rejected if the newly created model didn't
     * pass the typeguard check.
     * @param modeluri The URI of the model that should be created.
     * @param model The content of the new model object either as plain JSON object or string.
     * @param typeGuard A guard function to check if the received model element is of the expected type.
     * @returns The newly created model as typed JSON object `M`.
     */
    create<M>(modeluri: string, model: AnyObject | string, typeGuard: TypeGuard<M>): Promise<M>;
    /**
     * Creates a new model object with the given URI and content string in the current workspace.
     * A `format` string has to passed to let the modelserver know how the given content should be interpreted.
     * @param modeluri The URI of the model that should be created.
     * @param model The content of the new model object either as string.
     * @param format The desired format.
     * @returns The newly created model as string.
     */
    create(modeluri: string, model: string, format: string): Promise<string>;

    /**
     * Updates an existing model with the given URI with the given content in the current workspace.
     * The result promise is rejected if no matching model for the given URI exists.
     * @param modeluri The URI of the model that should be updated.
     * @param model The content of the updated model object either as string.
     * @returns The updated model as plain JSON object.
     */
    update(modeluri: string, model: AnyObject | string): Promise<AnyObject>;
    /**
     * Updates an existing model with the given URI with the given content in the current workspace.
     * The return type is derived from the given typeguard. The result promise is rejected if the updated model didn't
     * pass the typeguard check.
     * The result promise is rejected if no matching model for the given URI exists.
     * @param modeluri The URI of the model that should be updated.
     * @param model The content of the updated model object either as string.
     * @param typeGuard A guard function to check if the received model element is of the expected type.
     * @returns The updated model as typed JSON object `M`.
     */
    update<M>(modeluri: string, model: string | string, typeGuard: TypeGuard<M>): Promise<M>;
    /**
     * Updates an existing model with the given URI with the given content string in the current workspace.
     * A `format` string has to passed to let the modelserver know how the given content should be interpreted.
     * @param modeluri The URI of the model that should be updated.
     * @param model The content of the updated model object either as string.
     * @param format The desired format.
     * @returns The updated model as string.
     */
    update(modeluri: string, model: string, format: string): Promise<AnyObject>;

    /**
     * Persists all `dirty` changes for the model with the given URI.
     * @param modeluri The URI of the model whose dirty changes should be saved.
     * @returns A boolean indicating whether the saving was successful.
     */
    save(modeluri: string): Promise<boolean>;

    /**
     * Saves (i.e. persists the dirty changes of) all models that are loaded in the current workspace.
     * @returns A boolean indicating whether the saving was successful.
     */
    saveAll(): Promise<boolean>;

    /**
     * Validates the model with the given URI and returns the {@link Diagnostic} validation result.
     * @param modeluri The URI of the model that should be validated.
     * @returns The validation result as {@link Diagnostic}.
     */
    validate(modeluri: string): Promise<Diagnostic>;

    /**
     * Retrieves the EMF validation constraints for the model with the given URI
     * @param modeluri THe URI of the model whose constraints should be retrieved.
     * @returns The validation constraints as string.
     */
    getValidationConstraints(modeluri: string): Promise<string>;

    /**
     * Retrieves the JSON schema representation of the Ecore model with the given URI as plain JSON object.
     * Note: currently the JSON schema can only be derived from the Ecore (i.e. Meta) model. So the given URI
     * has to point to the Ecore model and not a concrete model instance. (e.g. `Coffee.ecore` instead of `Superbrewer3000.coffee)
     * @param modeluri The URI of the Ecore model whose JSON schema should be retrieved
     * @returns The corresponding JSON schema as plain JSON object.
     */
    getTypeSchema(modeluri: string): Promise<AnyObject>;

    /**
     * Retrieves the JSONForms UI schema for the given EClass literal as plain JSON object.
     * @param schemaname The EClass for which the schema should be retrieved.
     * @returns The UI schema as plain JSON object.
     */
    getUiSchema(schemaname: string): Promise<AnyObject>;

    /**
     * Configures the workspace location and optionally the UI schema folder location for the model server.
     * Should be one of the initial calls to the model server. Has to be called at least before any requests that retrieve or modify model information.
     * @param configuration The {@link ServerConfiguration}.
     * @returns A boolean indicating whether the model server was successfully configured.
     */
    configureServer(configuration: ServerConfiguration): Promise<boolean>;

    /**
     * Can be used to check whether the model server is alive and reachable.
     * @returns A boolean indicating whether the ping was successful.
     */
    ping(): Promise<boolean>;

    /**
     * Modifies the model with the given URI by executing the given {@link ModelServerCommand}.
     * @param modeluri The URI of the model that should be edited.
     * @param command The command that should be executed.
     * @returns A promise indicating whether the command execution was successful.
     */
    edit(modeluri: string, command: ModelServerCommand): Promise<boolean>;

    /**
     * Can be used to undo the latest edit change (i.e. command execution) for the model with the given URI.
     * @param modeluri The URI the model whose change should be undone.
     * @returns A string message indicating whether the change was successfully undone.
     */
    undo(modeluri: string): Promise<string>;

    /**
     * Can be used to redo the latest edit change (i.e. command execution) for the model with the given URI.
     * @param modeluri The URI the model whose change should be redone.
     * @returns A string message indicating whether the change was successfully redone.
     */
    redo(modeluri: string): Promise<string>;

    /**
     * Can be used to subscribe for model server notifications for the model with the given URI. For subscription communication
     * a websocket connection is used.
     * @param modeluri URI of the model to subscribe for.
     * @param options The options to configure the subscriptions behavior.
     */
    subscribe(modeluri: string, options?: SubscriptionOptions): void;

    /**
     * Can be used to send arbitrary {@link ModelServerMessage}s to the model server via a subscription channel.
     * @param modelUri The URI of the subscribed model.
     * @param message The model server message that should be sent.
     * @returns A boolean indicating whether the message submission was successful.
     */
    send(modelUri: string, message: ModelServerMessage): boolean;

    /**
     * Can be used to unsubscribe from model server notifications for the model with the given URI.
     * @param modeluri URI of the model to whose subscription should be canceled.
     * @returns A boolean indicating whether the unsubscribe process was successful.
     */
    unsubscribe(modelUri: string): boolean;
}

export namespace ModelServerClientApiV1 {
    export const API_ENDPOINT = '/api/v1';
}

/**
 * Options object that can be used to define options for the client on subscribing to the Model Server.
 * The options are optional and can configure the subscription format, timeout,
 * whether liveValidation should be enabled and errorWhenUnsuccessful.
 */
export interface SubscriptionOptions {
    format?: string;
    listener?: SubscriptionListener;
    timeout?: number;
    livevalidation?: boolean;
    errorWhenUnsuccessful?: boolean;
}

/**
 * Configuration object that can be sent by the client to configure
 * the workspaceRoot and the ui schema folder.
 */
export interface ServerConfiguration {
    workspaceRoot: string;
    uiSchemaFolder?: string;
}

/**
 * A `ModelServerError` is thrown by clients implementing {@link ModelServerClientApiV1} if a request to the
 * model server has failed. If the server responds with an error code and a valid {@link ModelServerMessage} the
 * error message is derived from the {@link ModelServerMessage.data} property. If no valid message was received i.e. the
 * request failed due to another internal error, the error message of the internal error is reused.
 */
export class ModelServerError extends Error {
    /** the error code */
    readonly code?: string;
    constructor(response: ModelServerMessage | string, code?: string) {
        super(typeof response === 'string' ? response : MessageDataMapper.asString(response));
        this.code = code;
    }
}
