/*********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *********************************************************************************/
import { expect } from 'chai';

import {
    IncrementalUpdateNotificationV2,
    ModelServerClientV2,
    ModelServerNotification,
    ModelServerNotificationListenerV2,
    ModelServerObjectV2,
    NotificationSubscriptionListenerV2,
    Operations,
    replace,
    SetCommand
} from '.';
import { ModelServerClientApiV2 } from './model-server-client-api-v2';

describe('Integration tests for ModelServerClientV2', () => {
    let client: ModelServerClientV2;
    const baseUrl = `http://localhost:8081${ModelServerClientApiV2.API_ENDPOINT}`;

    beforeEach(() => {
        client = new ModelServerClientV2();
        client.initialize(baseUrl);
    });

    describe('test requests', () => {
        it('edit with patch', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const newName = 'Super Brewer 6000';
            const machine = await client.get(modeluri, ModelServerObjectV2.is);
            const originalName = (machine as any).name;
            const patch = replace(modeluri, machine, 'name', newName);
            await client.edit(modeluri, patch);
            const model = await client.get(modeluri);
            expect(model.name).to.be.equal(newName);

            await client.undo(modeluri);
            const resetModel = await client.get(modeluri);
            expect(resetModel.name).to.be.equal(originalName);

            await client.redo(modeluri);
            const redoModel = await client.get(modeluri);
            expect(redoModel.name).to.be.equal(newName);

            // Restore initial state
            await client.undo(modeluri);
        });

        it('edit with command', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const newName = 'Super Brewer 6000';
            const machine = await client.get(modeluri, ModelServerObjectV2.is);
            const originalName = (machine as any).name;
            const owner = {
                eClass: machine.$type,
                $ref: `SuperBrewer3000.coffee#${machine.$id}`
            };
            const command = new SetCommand(owner, 'name', [newName]);
            await client.edit(modeluri, command);
            const model = await client.get(modeluri);
            expect(model.name).to.be.equal(newName);

            await client.undo(modeluri);
            const resetModel = await client.get(modeluri);
            expect(resetModel.name).to.be.equal(originalName);

            await client.redo(modeluri);
            const redoModel = await client.get(modeluri);
            expect(redoModel.name).to.be.equal(newName);

            // Restore initial state
            await client.undo(modeluri);
        });

        it('subscribe to changes', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const newName = 'Super Brewer 6000';
            const machine = await client.get(modeluri, ModelServerObjectV2.is);
            const owner = {
                eClass: machine.$type,
                $ref: `SuperBrewer3000.coffee#${machine.$id}`
            };
            const command = new SetCommand(owner, 'name', [newName]);

            const listener: ModelServerNotificationListenerV2 = {};

            const patchNotification: Promise<IncrementalUpdateNotificationV2> = new Promise((resolve, _rej) => {
                listener.onIncrementalUpdateV2 = resolve;
            });

            const subscription: Promise<ModelServerNotification> = new Promise((resolve, _rej) => {
                listener.onSuccess = resolve;
            });

            client.subscribe(modeluri, new NotificationSubscriptionListenerV2(listener));
            // Make sure the subscription is initialized before editing the model,
            // so that we don't miss the notification
            await subscription;

            await client.edit(modeluri, command);
            const notification = await patchNotification;
            const patch = notification.patch;

            expect(notification.modelUri).to.be.equal(modeluri);
            expect(patch.length).to.be.equal(1);
            const operation = patch[0];
            expect(Operations.isReplace(operation, 'string')).to.be.equal(true);
            expect(operation.path).to.be.equal('/name');
            if (Operations.isReplace(operation, 'string')) {
                expect(operation.value).to.be.equal(newName);
            }

            await client.undo(modeluri);
            client.unsubscribe(modeluri);
        });
    });
});
