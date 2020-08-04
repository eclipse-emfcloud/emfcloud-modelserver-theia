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
import { Event } from '@theia/core';

export const ModelServerSubscriptionService = Symbol(
    'ModelServerSubscriptionService'
);
export interface ModelServerSubscriptionService {
    readonly onOpenListener: Event<void>;
    readonly onClosedListener: Event<string>;
    readonly onErrorListener: Event<Error>;

    readonly onDirtyStateListener: Event<boolean>;
    readonly onIncrementalUpdateListener: Event<object>;
    readonly onFullUpdateListener: Event<object>;
    readonly onSuccessListener: Event<string>;
    readonly onUnknownMessageListener: Event<string>;
}
