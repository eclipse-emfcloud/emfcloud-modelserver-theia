/********************************************************************************
 * Copyright (c) 2020-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import {
    AnyObject,
    MessageDataMapper,
    MessageType,
    SubscriptionListener,
    SubscriptionOptionsV2
} from '@eclipse-emfcloud/modelserver-client';
import { TheiaBackendModelServerClientV2 } from '@eclipse-emfcloud/modelserver-theia/lib/node';
import { injectable } from '@theia/core/shared/inversify';
import URI from 'urijs';

import { DevModelServerClient } from '../common/dev-model-server-client';

@injectable()
export class CustomDevModelServerClient extends TheiaBackendModelServerClientV2 implements DevModelServerClient {
    private intervalId: NodeJS.Timeout;

    subscribe(modeluri: URI, listener?: SubscriptionListener, options: SubscriptionOptionsV2 = {}): SubscriptionListener {
        if (options.timeout) {
            this.setKeepAliveInterval(modeluri, options.timeout);
        }
        return super.subscribe(modeluri, listener, options);
    }

    private setKeepAliveInterval(modeluri: URI, timeout: number): void {
        if (!this.isSocketOpen(modeluri) && modeluri.toString() === 'Coffee.ecore') {
            this.intervalId = setInterval(
                () => this.send(modeluri, { type: MessageType.keepAlive, data: undefined }),
                timeout > 1000 ? timeout - 1000 : 1
            );
        }
    }

    unsubscribe(modeluri: URI): void {
        if (this.intervalId && modeluri.toString() === 'Coffee.ecore') {
            clearInterval(this.intervalId);
        }
        super.unsubscribe(modeluri);
    }

    async counter(operation?: 'add' | 'subtract', delta?: number): Promise<AnyObject> {
        return this.process(this.restClient.get('counter', { params: { operation, delta } }), MessageDataMapper.asObject);
    }
}
