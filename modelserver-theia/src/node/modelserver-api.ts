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
import { inject, injectable, optional } from "inversify";
import * as WebSocket from "ws";

import {
  DEFAULT_LAUNCH_OPTIONS,
  LaunchOptions,
  ModelServerClient,
  ModelServerCommand,
  ModelServerFrontendClient,
  Response,
  ServerConfiguration
} from "../common/model-server-client";
import { ModelServerPaths } from "../common/model-server-paths";
import { RestClient } from "./rest-client";

@injectable()
export class DefaultModelServerClient implements ModelServerClient {
  @inject(LaunchOptions)
  @optional()
  protected readonly options: LaunchOptions = DEFAULT_LAUNCH_OPTIONS;
  private restClient: RestClient;
  private openSockets: { [modelUri: string]: WebSocket } = {};
  private baseUrl: string;
  private client: ModelServerFrontendClient;

  initialize(): Promise<boolean> {
    this.prepareBaseUrl();
    this.restClient = new RestClient(this.baseUrl);
    return Promise.resolve(true);
  }
  prepareBaseUrl() {
    this.baseUrl = `http://${this.options.hostname}:${
      this.options.serverPort
      }/${this.options.baseURL}`;
    if (!this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl + '/';
    }
  }
  get(modelUri: string): Promise<Response<string>> {
    return this.restClient
      .get<{ data: string }>(
        `${ModelServerPaths.MODEL_CRUD}?modeluri=${modelUri}`
      )
      .then(r => r.mapBody(b => b.data));
  }

  getAll(): Promise<Response<string[] | string>> {
    return this.restClient
      .get<{ data: string }>(ModelServerPaths.MODEL_CRUD)
      .then(r => r.mapBody(b => b.data));
  }

  getElementById(modelUri: string, elementId: string): Promise<Response<string>> {
    return this.restClient
      .get<{ data: string }>(
        `${ModelServerPaths.MODEL_ELEMENT}?modeluri=${modelUri}&elementid=${elementId}`
      )
      .then(r => r.mapBody(b => b.data));
  }

  getElementByName(modelUri: string, elementName: string): Promise<Response<string>> {
    return this.restClient
      .get<{ data: string }>(
        `${ModelServerPaths.MODEL_ELEMENT}?modeluri=${modelUri}&elementname=${elementName}`
      )
      .then(r => r.mapBody(b => b.data));
  }

  delete(modelUri: string): Promise<Response<boolean>> {
    return this.restClient
      .remove<{ type: string }>(
        `${ModelServerPaths.MODEL_CRUD}?modeluri=${modelUri}`
      )
      .then(r => r.mapBody(b => b.type === 'success'));
  }
  save(modelUri: string): Promise<Response<boolean>> {
    return this.restClient
      .get<{ type: string }>(
        `${ModelServerPaths.SAVE}?modeluri=${modelUri}`
      )
      .then(r => r.mapBody(b => b.type === 'success'));
  }
  update(modelUri: string, newModel: any): Promise<Response<string>> {
    return this.restClient
      .patch<{ data: string }>(
        `${ModelServerPaths.MODEL_CRUD}?modeluri=${modelUri}`,
        JSON.stringify({ data: newModel })
      )
      .then(r => r.mapBody(b => b.data));
  }

  configure(configuration: ServerConfiguration): Promise<Response<boolean>> {
    const cleanPath = configuration.workspaceRoot.replace('file://', '');
    return this.restClient
      .put<{ type: string }>(ModelServerPaths.SERVER_CONFIGURE, JSON.stringify({ workspaceRoot: cleanPath }))
      .then(r => r.mapBody(b => b.type === 'success'));
  }

  ping(): Promise<Response<boolean>> {
    return this.restClient
      .get<{ type: string }>(ModelServerPaths.SERVER_PING)
      .then(r => r.mapBody(b => b.type === 'success'));
  }

  subscribe(modelUri: string): void {
    const path = `${this.baseUrl}${
      ModelServerPaths.SUBSCRIPTION
      }?modeluri=${modelUri}`;
    const socket = new WebSocket(path);
    socket.on('message', data => {
      this.client.onMessage(JSON.parse(data.toString()));
    });
    socket.on('close', (code, reason) => {
      this.client.onClosed(code, reason);
    });
    socket.on('error', error => {
      this.client.onError(error);
    });
    socket.on('open', () => {
      this.client.onOpen();
    });
    this.openSockets[modelUri] = socket;
  }
  unsubscribe(modelUri: string): void {
    const socket = this.openSockets[modelUri];
    if (socket) {
      socket.close();
    }
  }

  edit(
    modelUri: string,
    command: ModelServerCommand
  ): Promise<Response<boolean>> {
    return this.restClient
      .patch<{ type: string }>(
        `${ModelServerPaths.COMMANDS}?modeluri=${modelUri}`,
        JSON.stringify({ data: command })
      )
      .then(r => r.mapBody(b => b.type === 'success'));
  }

  getTypeSchema(modelUri: string): Promise<Response<string>> {
    return this.restClient
      .get<{ data: string }>(
        `${ModelServerPaths.TYPE_SCHEMA}?modeluri=${modelUri}`
      )
      .then(r => r.mapBody(b => b.data));
  }

  getUISchema(schemaname: string): Promise<Response<string>> {
    return this.restClient
      .get<{ data: string }>(
        `${ModelServerPaths.UI_SCHEMA}?schemaname=${schemaname}`
      )
      .then(r => r.mapBody(b => b.data));
  }

  setClient(client: ModelServerFrontendClient) {
    this.client = client;
  }

  dispose() {
    // FIXME implement
  }

  getLaunchOptions(): Promise<LaunchOptions> {
    return Promise.resolve(
      this.options ? this.options : DEFAULT_LAUNCH_OPTIONS
    );
  }
}
