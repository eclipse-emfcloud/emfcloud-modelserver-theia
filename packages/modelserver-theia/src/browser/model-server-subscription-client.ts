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
import {
    CloseNotification,
    DirtyStateNotification,
    ErrorNotification,
    FullUpdateNotification,
    IncrementalUpdateNotification,
    ModelServerNotification,
    ModelServerNotificationListener,
    NotificationSubscriptionListener,
    SubscriptionListener,
    UnknownNotification,
    ValidationNotification
} from '@eclipse-emfcloud/modelserver-client';
import { Emitter, Event } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';

export const ModelServerSubscriptionService = Symbol('ModelServerSubscriptionService');
export interface ModelServerSubscriptionService {
    readonly subscriptionListener: SubscriptionListener;

    readonly onOpen: Event<ModelServerNotification>;
    readonly onClose: Event<CloseNotification>;
    readonly onError: Event<ErrorNotification>;

    readonly onDirtyStateChange: Event<DirtyStateNotification>;
    readonly onIncrementalUpdate: Event<IncrementalUpdateNotification>;
    readonly onFullUpdate: Event<FullUpdateNotification>;
    readonly onSuccess: Event<ModelServerNotification>;
    readonly onUnknownMessage: Event<UnknownNotification>;
    readonly onValidationResult: Event<ValidationNotification>;
}
@injectable()
export class DefaultSubscriptionService implements ModelServerSubscriptionService {

    protected _subscriptionListener = this.createSubscriptionListener();

    protected createSubscriptionListener(): SubscriptionListener {
        const messageListener: ModelServerNotificationListener = {
            onOpen: msg => this.onOpenEmitter.fire(msg),
            onClose: msg => this.onClosedEmitter.fire(msg),
            onError: msg => this.onErrorEmitter.fire(msg),
            onSuccess: msg => this.onSuccessEmitter.fire(msg),
            onDirtyStateChanged: msg => this.onDirtyStateChangeEmitter.fire(msg),
            onIncrementalUpdate: msg => this.onIncrementalUpdateEmitter.fire(msg),
            onFullUpdate: msg => this.onFullUpdateEmitter.fire(msg),
            onValidation: msg => this.onValidationResultEmitter.fire(msg),
            onUnknown: msg => this.onUnknownMessageEmitter.fire(msg)
        };

        return new NotificationSubscriptionListener(messageListener);
    }
    get subscriptionListener(): SubscriptionListener {
        return this._subscriptionListener;
    }

    protected onOpenEmitter = new Emitter<ModelServerNotification>();
    get onOpen(): Event<Readonly<ModelServerNotification>> {
        return this.onOpenEmitter.event;
    }

    protected onClosedEmitter = new Emitter<CloseNotification>();
    get onClose(): Event<Readonly<CloseNotification>> {
        return this.onClosedEmitter.event;
    }

    protected onErrorEmitter = new Emitter<ErrorNotification>();
    get onError(): Event<Readonly<ErrorNotification>> {
        return this.onErrorEmitter.event;
    }

    protected onDirtyStateChangeEmitter = new Emitter<DirtyStateNotification>();
    get onDirtyStateChange(): Event<Readonly<DirtyStateNotification>> {
        return this.onDirtyStateChangeEmitter.event;
    }

    protected onIncrementalUpdateEmitter = new Emitter<IncrementalUpdateNotification>();
    get onIncrementalUpdate(): Event<Readonly<IncrementalUpdateNotification>> {
        return this.onIncrementalUpdateEmitter.event;
    }
    protected onFullUpdateEmitter = new Emitter<FullUpdateNotification>();
    get onFullUpdate(): Event<Readonly<FullUpdateNotification>> {
        return this.onFullUpdateEmitter.event;
    }

    protected onSuccessEmitter = new Emitter<ModelServerNotification>();
    get onSuccess(): Event<Readonly<ModelServerNotification>> {
        return this.onSuccessEmitter.event;
    }

    protected onUnknownMessageEmitter = new Emitter<Readonly<UnknownNotification>>();
    get onUnknownMessage(): Event<Readonly<UnknownNotification>> {
        return this.onUnknownMessageEmitter.event;
    }

    protected onValidationResultEmitter = new Emitter<Readonly<ValidationNotification>>();
    get onValidationResult(): Event<Readonly<ValidationNotification>> {
        return this.onValidationResultEmitter.event;
    }
}
