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
import { ModelServerPaths, Response, ResponseBody } from '@eclipse-emfcloud/modelserver-theia';
import { DefaultModelServerClient } from '@eclipse-emfcloud/modelserver-theia/lib/node';
import { injectable } from 'inversify';

import { DevModelServerClient } from '../common/dev-model-server-client';

@injectable()
export class CustomDevModelServerClient extends DefaultModelServerClient implements DevModelServerClient {
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
            console.warn(modelUri + ': Cannot open new socket, already subscribed!');
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

    async counter(operation: 'add' | 'subtract' | undefined, delta: number | undefined): Promise<Response<string>> {
        let url = 'counter?';
        if (operation) {
            url += 'operation=' + operation;
        }
        if (delta) {
            url += operation ? '&delta=' + delta : 'delta=' + delta;
        }
        const response = await this.restClient.get(url);
        return response.mapBody(ResponseBody.asString);
    }
}
