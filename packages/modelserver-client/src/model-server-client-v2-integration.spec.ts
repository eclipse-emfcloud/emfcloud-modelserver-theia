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
    add,
    create,
    IncrementalUpdateNotificationV2,
    ModelServerClientV2,
    ModelServerNotification,
    ModelServerNotificationListenerV2,
    ModelServerObjectV2,
    NotificationSubscriptionListenerV2,
    Operations,
    removeObject,
    removeValueAt,
    replace,
    SetCommand
} from '.';
import { ModelServerClientApiV2 } from './model-server-client-api-v2';

describe('Integration tests for ModelServerClientV2', () => {
    let client: ModelServerClientV2;
    const baseUrl = `http://localhost:8081${ModelServerClientApiV2.API_ENDPOINT}`;

    const testUndoRedo: (modeluri: string, originalModel: any, patchedModel: any) => void = async (modeluri, originalModel, patchedModel) => {
        await client.undo(modeluri);
        const undoModel = await client.get(modeluri);
        expect(undoModel).to.deep.equal(originalModel);

        await client.redo(modeluri);
        const redoModel = await client.get(modeluri);
        expect(redoModel).to.deep.equal(patchedModel);

        // Restore initial state
        await client.undo(modeluri);
    };

    beforeEach(() => {
        client = new ModelServerClientV2();
        client.initialize(baseUrl);
    });

    describe('test requests', () => {
        it('edit with patch', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const newName = 'Super Brewer 6000';
            const machine = await client.get(modeluri, ModelServerObjectV2.is);
            const patch = replace(modeluri, machine, 'name', newName);
            await client.edit(modeluri, patch);
            const model = await client.get(modeluri);
            expect(model.name).to.be.equal(newName);

            await testUndoRedo(modeluri, machine, model);
        });

        it('create with patch', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const originalModel = await client.get(modeluri, ModelServerObjectV2.is);
            const newWorkflowName = 'New Test Workflow';
            const initialWorkflowsCount: number = (originalModel as any).workflows.length;

            const patch = create(modeluri, originalModel, 'workflows', 'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Workflow', {name: newWorkflowName});
            await client.edit(modeluri, patch);
            const patchedModel = await client.get(modeluri);

            const workflows = patchedModel.workflows as any[];
            expect(workflows.length).to.be.equal(initialWorkflowsCount + 1);
            const newWorkflow = (patchedModel as any).workflows[initialWorkflowsCount];

            expect(newWorkflow.name).to.be.equal(newWorkflowName);
            expect(newWorkflow).to.have.property('$id');
            expect(newWorkflow.$id).to.be.a('string');

            await testUndoRedo(modeluri, originalModel, patchedModel);
        });

        it('add with patch', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const initialModel = await client.get(modeluri, ModelServerObjectV2.is);

            // Add a second workflow to the model; we'll use it to move a Task from a workflow to the other
            const createWorkflow = create(modeluri, initialModel, 'workflows', 'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Workflow', {name: "New Workflow"});
            await client.edit(modeluri, createWorkflow);
            const originalModel = await client.get(modeluri, ModelServerObjectV2.is);
            const sourceWF = (originalModel as any).workflows[0];
            const targetWF = (originalModel as any).workflows[1];

            const patch = add(modeluri, targetWF, "nodes", sourceWF.nodes[0]);
            await client.edit(modeluri, patch);
            const patchedModel = await client.get(modeluri);
            
            const patchedSourceWF = (patchedModel as any).workflows[0];
            const patchedTargetWF = (patchedModel as any).workflows[1];
            
            expect(patchedSourceWF.nodes).to.be.undefined;
            expect(patchedTargetWF.nodes).to.be.an('array').of.length(1);
            expect(patchedTargetWF.nodes[0].name).to.be.equal(sourceWF.nodes[0].name); // Node was moved

            await testUndoRedo(modeluri, originalModel, patchedModel);
        });

        it('delete with patch - index based', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const originalModel = await client.get(modeluri, ModelServerObjectV2.is);

            const parentWorkflow = (originalModel as any).workflows[0];
            expect(parentWorkflow.nodes).to.be.an('array').that.is.not.empty;
            const patch = removeValueAt(modeluri, parentWorkflow, 'nodes', 0);

            await client.edit(modeluri, patch);
            const patchedModel = await client.get(modeluri);
            const patchedParentWorkflow = (patchedModel as any).workflows[0];
            expect(patchedParentWorkflow.nodes).to.be.undefined;

            await testUndoRedo(modeluri, originalModel, patchedModel);
        });

        it('delete with patch - object', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const originalModel = await client.get(modeluri, ModelServerObjectV2.is);

            const parentWorkflow = (originalModel as any).workflows[0];
            expect(parentWorkflow.nodes).to.be.an('array').that.is.not.empty;
            const valueToRemove = parentWorkflow.nodes[0];
            const patch = removeObject(modeluri, valueToRemove);

            await client.edit(modeluri, patch);
            const patchedModel = await client.get(modeluri);

            const patchedParentWorkflow = (patchedModel as any).workflows[0];
            expect(patchedParentWorkflow.nodes).to.be.undefined;

            await testUndoRedo(modeluri, originalModel, patchedModel);
        });

        it('edit with command', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const newName = 'Super Brewer 6000';
            const originalModel = await client.get(modeluri, ModelServerObjectV2.is);
            const owner = {
                eClass: originalModel.$type,
                $ref: `SuperBrewer3000.coffee#${originalModel.$id}`
            };
            const command = new SetCommand(owner, 'name', [newName]);
            await client.edit(modeluri, command);
            const model = await client.get(modeluri);
            expect(model.name).to.be.equal(newName);

            await testUndoRedo(modeluri, originalModel, model);
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

