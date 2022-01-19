/********************************************************************************
 * Copyright (c) 2020-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { AnyObject, MessageDataMapper, MessageType, SubscriptionOptions } from '@eclipse-emfcloud/modelserver-client';
import { TheiaBackendModelServerClient } from '@eclipse-emfcloud/modelserver-theia/lib/node';
import { injectable } from '@theia/core/shared/inversify';

import { DevModelServerClient } from '../common/dev-model-server-client';

@injectable()
export class CustomDevModelServerClient extends TheiaBackendModelServerClient implements DevModelServerClient {
    private intervalId: NodeJS.Timeout;

    subscribe(modeluri: string, options: SubscriptionOptions = {}): void {
        if (options.timeout) {
            this.setKeepAliveInterval(modeluri, options.timeout);
        }
        return super.subscribe(modeluri, options);
    }

    private setKeepAliveInterval(modelUri: string, timeout: number): void {
        if (!this.isSocketOpen(modelUri) && modelUri === 'Coffee.ecore') {
            this.intervalId = setInterval(() => this.send(modelUri, { type: MessageType.keepAlive, data: undefined }), timeout > 1000 ? timeout - 1000 : 1);
        }
    }

    unsubscribe(modelUri: string): void {
        const openSocket = this.openSockets.get(modelUri);
        if (openSocket) {
            openSocket.close();
            this.openSockets.delete(modelUri);
        } else {
            console.warn(modelUri + ': Cannot unsubscribe, no socket opened!');
        }
        if (this.intervalId && modelUri === 'Coffee.ecore') {
            clearInterval(this.intervalId);
        }
    }

    async counter(operation?: 'add' | 'subtract', delta?: number): Promise<AnyObject> {
        return this.process(this.restClient.get('counter', { params: { operation, delta } }), MessageDataMapper.asObject);
    }
}
