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
import { ModelServerSubscriptionListener } from '@eclipse-emfcloud/modelserver-theia/lib/common';
import { MessageService } from '@theia/core';
import { inject, injectable } from 'inversify';

@injectable()
export class DevModelServerSubscriptionListener implements ModelServerSubscriptionListener {

    @inject(MessageService) protected readonly messageService: MessageService;

    constructor() {
        console.log('WebWebsocketListener created');
    }

    onOpened(modelUri: string): void {
        this.showSocketInfo('Subscription opened!', modelUri);
    }

    onClosed(modelUri: string, reason: string): void {
        this.showSocketInfo(`Subscription closed! Reason: ${reason}`, modelUri);
    }

    onWarning(modelUri: string, warning: string): void {
        this.showSocketWarning(`Warning: ${warning}`, modelUri);
    }

    onError(modelUri: string, error: any): void {
        this.showSocketError(`Error! ${JSON.stringify(error)}`, modelUri);
    }

    onDirtyState(modelUri: string, dirtyState: boolean): void {
        this.showSocketInfo(`DirtyState ${dirtyState}`, modelUri);
    }

    onIncrementalUpdate(modelUri: string, incrementalUpdate: object): void {
        this.showSocketInfo(`IncrementalUpdate ${JSON.stringify(incrementalUpdate)}`, modelUri);
    }

    onFullUpdate(modelUri: string, fullUpdate: object): void {
        this.showSocketInfo(`FullUpdate ${JSON.stringify(fullUpdate)}`, modelUri);
    }

    onSuccess(modelUri: string, successMessage: string): void {
        this.showSocketInfo(`Success ${successMessage}`, modelUri);
    }

    onUnknownMessage(modelUri: string, message: string): void {
        this.showSocketWarning(`Unknown Message ${JSON.stringify(message)}`, modelUri);
    }

    private showSocketInfo(message: string, modelUri = ''): void {
        const now = new Date(Date.now());
        this.messageService.info(`${now.toISOString()} | [${modelUri}]: ${message}`);
    }

    private showSocketWarning(message: string, modelUri = ''): void {
        const now = new Date(Date.now());
        this.messageService.warn(`${now.toISOString()} | [${modelUri}]: ${message}`);
    }

    private showSocketError(message: string, modelUri = ''): void {
        const now = new Date(Date.now());
        this.messageService.error(`${now.toISOString()} | [${modelUri}]: ${message}`);
    }
}
