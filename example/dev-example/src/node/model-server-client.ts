/********************************************************************************
 * Copyright (c) 2020 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { ModelServerPaths } from '@eclipse-emfcloud/modelserver-theia';
import { DefaultModelServerClient } from '@eclipse-emfcloud/modelserver-theia/lib/node';
import { injectable } from 'inversify';

@injectable()
export class DevModelServerClient extends DefaultModelServerClient {

    private intervalId: NodeJS.Timeout;

    subscribeWithTimeout(modelUri: string, timeout: number): void {
        const path = `${this.baseUrl}${ModelServerPaths.SUBSCRIPTION}?modeluri=${modelUri}&timeout=${timeout}`;
        this.setKeepAliveInterval(modelUri, timeout);
        this.doSubscribe(modelUri, path);
    }

    subscribeWithTimeoutAndFormat(modelUri: string, timeout: number, format: string): void {
        const path = `${this.baseUrl}${ModelServerPaths.SUBSCRIPTION}?modeluri=${modelUri}&timeout=${timeout}&format=${format}`;
        this.setKeepAliveInterval(modelUri, timeout);
        this.doSubscribe(modelUri, path);
    }

    private setKeepAliveInterval(modelUri: string, timeout: number): void {
        if (!this.isSocketOpen(modelUri) && modelUri === 'Coffee.ecore') {
            this.intervalId = setInterval(() => this.sendKeepAlive(modelUri), timeout > 1000 ? timeout - 1000 : 1);
        }
    }

    protected doSubscribe(modelUri: string, path: string): void {
        if (!this.isSocketOpen(modelUri)) {
            super.doSubscribe(modelUri, path);
        } else {
            this.subscriptionClient.fireUserWarning('Cannot open new socket, already subscribed!', modelUri);
        }
    }

    unsubscribe(modelUri: string): void {
        const openSocket = this.openSockets.get(modelUri);
        if (openSocket) {
            openSocket.close();
            this.openSockets.delete(modelUri);
        } else {
            this.subscriptionClient.fireUserWarning('Cannot unsubscribe, no socket opened!', modelUri);
        }
        if (this.intervalId && modelUri === 'Coffee.ecore') {
            clearInterval(this.intervalId);
        }
    }

}
