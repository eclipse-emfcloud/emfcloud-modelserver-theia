/********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import { expect } from 'chai';
import jsonpatch, { deepClone, Operation } from 'fast-json-patch';

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

    const testUndoRedo: (modeluri: string, originalModel: any, patchedModel: any) => void = async (
        modeluri,
        originalModel,
        patchedModel
    ) => {
        // Expected: originalModel === undoModel === patchedUndoModel
        // Expected: patchedModel === redoModel === patchedRedoModel
        const undoPatch = await client.undo(modeluri);
        const undoModel = await client.get(modeluri, ModelServerObjectV2.is);
        expect(undoModel).to.deep.equal(originalModel);

        const patchedUndoModel = undoPatch.patchModel!(patchedModel, true);
        expect(patchedUndoModel).to.deep.equal(originalModel);

        const redoPatch = await client.redo(modeluri);
        const redoModel = await client.get(modeluri, ModelServerObjectV2.is);
        expect(redoModel).to.deep.equal(patchedModel);

        const patchedRedoModel = redoPatch.patchModel!(patchedUndoModel, true);
        expect(patchedRedoModel).to.deep.equal(patchedModel);

        // Restore initial state
        await client.undo(modeluri);
    };

    beforeEach(() => {
        client = new ModelServerClientV2();
        client.initialize(baseUrl, 'json-v2');
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

            const patch = create(
                modeluri,
                originalModel,
                'workflows',
                'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Workflow',
                { name: newWorkflowName }
            );
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
            const createWorkflow = create(
                modeluri,
                initialModel,
                'workflows',
                'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Workflow',
                { name: 'New Workflow' }
            );
            await client.edit(modeluri, createWorkflow);
            const originalModel = await client.get(modeluri, ModelServerObjectV2.is);
            const sourceWF = (originalModel as any).workflows[0];
            const targetWF = (originalModel as any).workflows[1];

            const patch = add(modeluri, targetWF, 'nodes', sourceWF.nodes[0]);
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

        it('incremental patch update', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const newName = 'Super Brewer 6000';
            const machine = await client.get(modeluri, ModelServerObjectV2.is);
            const patch = replace(modeluri, machine, 'name', newName);
            const updateResult = await client.edit(modeluri, patch);
            expect(updateResult.success).to.be.true;
            expect(updateResult.patchModel).to.not.be.undefined;
            expect(updateResult.patch).to.not.be.undefined;

            // Patch a copy of the model (machine), to make sure the original model is
            // unchanged. We'll need it later to check undo/redo behavior.
            const patchedMachine = updateResult.patchModel!(machine, true);
            expect((patchedMachine as any).name).to.be.equal(newName);

            // Check that the incremental update is consistent with the server version of the model
            const newMachine = await client.get(modeluri, ModelServerObjectV2.is);
            expect(newMachine).to.deep.equal(patchedMachine);

            await testUndoRedo(modeluri, machine, patchedMachine);
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

        it('subscribe to incremental updates', async () => {
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

            // Apply the incremental patch on the original model
            const incrementalPatchedModel = notification.patchModel(machine, true);
            // Retrieve the current model from the model server
            const patchedModel = await client.get(modeluri, ModelServerObjectV2.is);

            // Check that the incrementally-patched model to be identical to the version
            // from the model server.
            expect(incrementalPatchedModel).to.deep.equal(patchedModel);

            await client.undo(modeluri);
            client.unsubscribe(modeluri);
        });

        it('pure Json Patch changes', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const newName = 'Super Brewer 6000';
            const machine = await client.get(modeluri, ModelServerObjectV2.is);

            const patchedMachine = deepClone(machine);

            // Directly change the model
            patchedMachine.name = newName;
            patchedMachine.children[1].processor.clockSpeed = 6;

            // Generate patch by diffing the original model and the patched one
            const patch = jsonpatch.compare(machine, patchedMachine);

            await client.edit(modeluri, patch);
            const model = await client.get(modeluri);
            expect(model.name).to.be.equal(newName);
            expect((model as any).children[1].processor.clockSpeed).to.be.equal(6);

            await testUndoRedo(modeluri, machine, model);
        });

        it('clear list with "remove" patch operation', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const machine = await client.get(modeluri, ModelServerObjectV2.is);

            const initialWorkflowsSize = (machine as any).workflows.length;
            expect(initialWorkflowsSize).to.not.be.equal(0);

            const patch: Operation[] = [
                {
                    op: 'remove',
                    path: '/workflows'
                }
            ];

            await client.edit(modeluri, patch);
            const model = await client.get(modeluri);

            const newWorkflows = (model as any).workflows;
            expect(newWorkflows).to.be.undefined;

            await testUndoRedo(modeluri, machine, model);
        });

        it('unset value with "remove" patch operation', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const machine = await client.get(modeluri, ModelServerObjectV2.is);

            const initialValue = (machine as any).children[1].processor.thermalDesignPower;
            expect(initialValue).to.not.be.oneOf([undefined, 0]);

            const patch: Operation[] = [
                {
                    op: 'remove',
                    path: '/children/1/processor/thermalDesignPower'
                }
            ];

            await client.edit(modeluri, patch);
            const model = await client.get(modeluri);

            const newValue = (model as any).children[1].processor.thermalDesignPower;
            expect(newValue).to.be.oneOf([undefined, 0]); // Should be === 0, but default values are not converted to Json at the moment; so we also expect 'undefined'

            await testUndoRedo(modeluri, machine, model);
        });

        it('check all patch replies', async () => {
            const modeluri = 'SuperBrewer3000.coffee';
            const newName = 'Super Brewer 6000';
            const machine = await client.get(modeluri, ModelServerObjectV2.is);

            const patchedMachine = deepClone(machine);

            // Directly change the model
            patchedMachine.name = newName;
            patchedMachine.children[1].processor.clockSpeed = 6;

            // Generate patch by diffing the original model and the patched one
            const patch = jsonpatch.compare(machine, patchedMachine);

            const result = await client.edit(modeluri, patch);
            expect(result.success).to.be.true;

            expect(result.patch).to.not.be.undefined;
            expect(result.allPatches).to.not.be.undefined;
            expect(result.allPatches).to.be.an('array').of.length(1);

            // Patch the main resource
            const updatedMachineMainPatch = result.patchModel!(machine, true);
            expect(patchedMachine).to.deep.equal(updatedMachineMainPatch);

            // Patch the first resource
            const updatedMachineFirstPatch = result.patchModel!(machine, true, result.allPatches![0].modelUri);
            expect(patchedMachine).to.deep.equal(updatedMachineFirstPatch);

            await testUndoRedo(modeluri, machine, updatedMachineFirstPatch);
        });
    });
});
