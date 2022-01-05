/********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import { ModelServerClient, SubscriptionListener, SubscriptionOptions } from '@eclipse-emfcloud/modelserver-client';
import { decorate, injectable } from '@theia/core/shared/inversify';

import { ModelServerFrontendSubscriptionListener } from '../common';

decorate(injectable(), ModelServerClient);

@injectable()
export class TheiaModelServerClient extends ModelServerClient {
    protected subscriptionListener: ModelServerFrontendSubscriptionListener;

    subscribe(modeluri: string, options: SubscriptionOptions = {}): SubscriptionListener {
        if (!options.listener) {
            options.listener = this.subscriptionListener;
        }
        return super.subscribe(modeluri, options);
    }

    setListener(listener: ModelServerFrontendSubscriptionListener): void {
        this.subscriptionListener = listener;
    }

    dispose(): void {
        Array.from(this.openSockets.values()).forEach(openSocket => openSocket.close());
    }
}
