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
import { ModelServerClient, SubscriptionOptions } from '@eclipse-emfcloud/modelserver-client';
import { decorate, inject, injectable, optional } from '@theia/core/shared/inversify';
import URI from 'urijs';
import { CancellationToken } from 'vscode-jsonrpc';

import { ModelServerFrontendClient, TheiaModelServerClient } from '../common';
import { DEFAULT_LAUNCH_OPTIONS, LaunchOptions } from './launch-options';

decorate(injectable(), ModelServerClient);

@injectable()
export class TheiaBackendModelServerClient extends ModelServerClient implements TheiaModelServerClient {
    constructor(@inject(LaunchOptions) @optional() protected readonly launchOptions: LaunchOptions = DEFAULT_LAUNCH_OPTIONS) {
        super();
        const baseUrl = this.getBaseUrl();
        this.initialize(baseUrl);
    }

    protected getBaseUrl(): URI {
        const baseUrl = new URI({
            protocol: 'http',
            hostname: this.launchOptions.hostname,
            port: this.launchOptions.serverPort,
            path: this.launchOptions.baseURL
        });
        return baseUrl;
    }

    protected subscriptionClient?: ModelServerFrontendClient;

    setClient(client: ModelServerFrontendClient | undefined): void {
        this.subscriptionClient = client;
    }

    subscribe(modeluri: URI, options: SubscriptionOptions = {}): void {
        // Handle optional arguments finding the RPC cancellation token in their place
        if (CancellationToken.is(options)) {
            options = {};
        }

        if (!options.listener) {
            options.listener = this.subscriptionClient;
        }
        super.subscribe(modeluri, options);
    }

    dispose(): void {
        Array.from(this.openSockets.values()).forEach(openSocket => openSocket.close());
    }
}
