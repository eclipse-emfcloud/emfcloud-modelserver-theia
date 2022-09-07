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
    AddCommand,
    CompoundCommand,
    Format,
    ModelServerClientV2,
    ModelServerCommand,
    ModelUpdateResult,
    PatchOrCommand,
    RemoveCommand,
    SetCommand,
    SubscriptionListener,
    SubscriptionOptionsV2
} from '@eclipse-emfcloud/modelserver-client';
import { decorate, inject, injectable, optional } from '@theia/core/shared/inversify';
import { CancellationToken } from 'vscode-jsonrpc';

import { ModelServerFrontendClient, TheiaModelServerClientV2 } from '../common';
import { DEFAULT_MODELSERVER_NODE_LAUNCH_OPTIONS, LaunchOptions } from './launch-options';

decorate(injectable(), ModelServerClientV2);

@injectable()
export class TheiaBackendModelServerClientV2 extends ModelServerClientV2 implements TheiaModelServerClientV2 {
    protected subscriptionClient?: ModelServerFrontendClient;

    constructor(
        @inject(LaunchOptions) @optional() protected readonly launchOptions: LaunchOptions = DEFAULT_MODELSERVER_NODE_LAUNCH_OPTIONS
    ) {
        super();
        const baseUrl = this.getBaseUrl();
        this.initialize(baseUrl);
    }

    dispose(): void {
        Array.from(this.openSockets.values()).forEach(openSocket => openSocket.close());
    }

    protected getBaseUrl(): string {
        // We construct URLs by prepending and appending the base URL with '/' separators, so make
        // sure that we won't be repeating those separators else we'll get 404s
        const optionsUrl = trimSeparators(this.launchOptions.baseURL);
        const baseUrl = `http://${this.launchOptions.hostname}:${this.launchOptions.serverPort}/${optionsUrl}`;
        return baseUrl;
    }

    setClient(client: ModelServerFrontendClient | undefined): void {
        this.subscriptionClient = client;
    }

    subscribe(modeluri: string, listener?: SubscriptionListener, options: SubscriptionOptionsV2 = {}): SubscriptionListener {
        // Handle optional arguments finding the RPC cancellation token in their place
        if (CancellationToken.is(listener)) {
            listener = undefined;
        } else if (CancellationToken.is(options)) {
            options = {};
        }

        if (!listener && options.listener) {
            // Handle the v1 behaviour
            listener = options.listener;
            delete options.listener;
        }

        if (!listener) {
            // Could still be undefined if not in the options
            listener = this.subscriptionClient;
        }

        return super.subscribe(modeluri, listener!, options);
    }

    selfSubscribe(modeluri: string, options: SubscriptionOptionsV2 = {}): void {
        // Handle optional arguments finding the RPC cancellation token in their place
        if (CancellationToken.is(options)) {
            options = {};
        }

        this.subscribe(modeluri, undefined, options);
    }

    edit(modeluri: string, patchOrCommand: PatchOrCommand, format?: Format): Promise<ModelUpdateResult> {
        if (ModelServerCommand.is(patchOrCommand)) {
            return super.edit(modeluri, ensureCommandPrototype(patchOrCommand));
        }
        return super.edit(modeluri, patchOrCommand, format);
    }
}

/**
 * The client API that we extend expects actual instance-of relationships
 * in the command classes, but we lose the prototype chain when sending
 * commands over the RPC wire from the frontend to the backend. So this
 * function restores the correct prototype to a `command`.
 *
 * @param command a command that came from the Theia frontend
 * @returns the `command`, now with the expected prototype chain
 */
function ensureCommandPrototype<T extends ModelServerCommand>(command: T): T {
    if (SetCommand.is(command)) {
        Object.setPrototypeOf(command, SetCommand.prototype);
    } else if (AddCommand.is(command)) {
        Object.setPrototypeOf(command, AddCommand.prototype);
    } else if (RemoveCommand.is(command)) {
        Object.setPrototypeOf(command, RemoveCommand.prototype);
    } else if (CompoundCommand.is(command)) {
        Object.setPrototypeOf(command, CompoundCommand.prototype);
        (command as CompoundCommand).commands.forEach(ensureCommandPrototype);
    }
    return Object.setPrototypeOf(command, ModelServerCommand.prototype);
}

/**
 * We construct URLs by prepending and appending the base URL with '/' separators, so
 * this function trims any leading and trailing separators to make sure that we won't
 * be repeating those separators else we'll get 404s.
 *
 * @param url the URL to trim
 * @returns the trimmed URL
 */
function trimSeparators(url: string | undefined): string | undefined {
    if (url) {
        while (url.startsWith('/')) {
            url = url.substring(1);
        }
        while (url.endsWith('/')) {
            url = url.substring(0, url.length - 1);
        }
    }
    return url;
}
