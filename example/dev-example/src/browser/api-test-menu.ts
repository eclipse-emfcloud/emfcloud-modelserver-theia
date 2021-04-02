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
import { DiagnosticManager } from '@eclipse-emfcloud/modelserver-markers-theia/lib/browser';
import { Diagnostic } from '@eclipse-emfcloud/modelserver-theia/lib/browser';
import {
    AddCommand,
    CommandExecutionResult,
    CompoundCommand,
    ModelServerMessage,
    ModelServerResponse,
    ModelServerSubscriptionService,
    RemoveCommand,
    Response,
    SetCommand
} from '@eclipse-emfcloud/modelserver-theia/lib/common';
import {
    Command,
    CommandContribution,
    CommandRegistry,
    MAIN_MENU_BAR,
    MenuContribution,
    MenuModelRegistry,
    MessageService
} from '@theia/core';
import URI from '@theia/core/lib/common/uri';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { inject, injectable, postConstruct } from 'inversify';

import { DevModelServerClient, UpdateTaskNameCommand } from '../common/dev-model-server-client';

/* ModelServer commands */
export const PingCommand: Command = {
    id: 'ApiTest.Ping',
    label: 'ping()'
};

export const GetAllCommand: Command = {
    id: 'ApiTest.GetAll',
    label: 'getAll()'
};

export const GetModelUrisCommand: Command = {
    id: 'ApiTest.GetModelUris',
    label: 'getModelUris()'
};

export const SaveAllCommand: Command = {
    id: 'ApiTest.SaveAll',
    label: 'saveAll()'
};

export const GetTypeSchemaCommand: Command = {
    id: 'ApiTest.GetTypeSchema',
    label: 'getTypeSchema(Coffee.ecore)'
};

export const GetUiSchemaCommand: Command = {
    id: 'ApiTest.GetUiSchema',
    label: 'getUiSchema(ControlUnitView)'
};

/* Coffee.ecore commands */
export const GetModelCoffeeEcoreCommand: Command = {
    id: 'ApiTest.GetModel.CoffeeEcore',
    label: 'getModel(Coffee.ecore)'
};

export const GetModelXmiCoffeeEcoreCommand: Command = {
    id: 'ApiTest.GetModelXmi.CoffeeEcore',
    label: 'getModel(Coffee.ecore, xmi)'
};

export const GetModelElementByIdCoffeeEcoreCommand: Command = {
    id: 'ApiTest.GetModelElementById.CoffeeEcore',
    label: 'getModelElementById(Coffee.ecore, //@eClassifiers.2)'
};

export const GetModelElementByIdXmiCoffeeEcoreCommand: Command = {
    id: 'ApiTest.GetModelElementByIdXmi.CoffeeEcore',
    label: 'getModelElementById(Coffee.ecore, //@eClassifiers.2, xmi)'
};

export const GetModelElementByNameCoffeeEcoreCommand: Command = {
    id: 'ApiTest.GetModelElementByName.CoffeeEcore',
    label: 'getModelElementByName(Coffee.ecore, Machine)'
};

export const GetModelElementByNameXmiCoffeeEcoreCommand: Command = {
    id: 'ApiTest.GetModelElementByNameXmi.CoffeeEcore',
    label: 'getModelElementByName(Coffee.ecore, Machine, xmi)'
};

export const EditCompoundCoffeeEcoreCommand: Command = {
    id: 'ApiTest.EditCompound.CoffeeEcore',
    label: 'edit(Coffee.ecore,{type:compound})'
};

export const EditSetCoffeeEcoreCommand: Command = {
    id: 'ApiTest.EditSet.CoffeeEcore',
    label: 'edit(Coffee.ecore,{type:set})'
};

export const EditAddCoffeeEcoreCommand: Command = {
    id: 'ApiTest.EditAdd.CoffeeEcore',
    label: 'edit(Coffee.ecore,{type:add})'
};

export const EditRemoveCoffeeEcoreCommand: Command = {
    id: 'ApiTest.EditRemove.CoffeeEcore',
    label: 'edit(Coffee.ecore,{type:remove})'
};

export const UndoCoffeeEcoreCommand: Command = {
    id: 'ApiTest.Undo.CoffeeEcore',
    label: 'undo(Coffee.ecore)'
};

export const RedoCoffeeEcoreCommand: Command = {
    id: 'ApiTest.Redo.CoffeeEcore',
    label: 'redo(Coffee.ecore)'
};

export const SaveCoffeeEcoreCommand: Command = {
    id: 'ApiTest.Save.CoffeeEcore',
    label: 'save(Coffee.ecore)'
};

export const ValidationCoffeeEcoreCommand: Command = {
    id: 'ApiTest.Validation.CoffeeEcore',
    label: 'validate(Coffee.ecore)'
};

export const ValidationMarkersCoffeeEcoreCommand: Command = {
    id: 'ApiTest.ValidationMarkers.CoffeeEcore',
    label: 'validateAndCreateMarkers(Coffee.ecore)'
};

export const ValidationConstraintsCoffeeEcoreCommand: Command = {
    id: 'ApiTest.ValidationConstraints.CoffeeEcore',
    label: 'validationConstraints(Coffee.ecore)'
};

export const SubscribeWithValidationCoffeeEcoreCommand: Command = {
    id: 'ApiTest.SubscribeWithValidation',
    label: 'subscribeWithValidation(Coffee.ecore)'
};

export const SubscribeAndKeepAliveCommand: Command = {
    id: 'ApiTest.SubscribeAndKeepAlive',
    label: 'subscribeAndKeepAlive(Coffee.ecore, 60000)'
};

export const SubscribeAndKeepAliveXmiCommand: Command = {
    id: 'ApiTest.SubscribeAndKeepAliveXmi',
    label: 'subscribeAndKeepAlive(Coffee.ecore, 60000, xmi)'
};

export const UnsubscribeKeepAliveCommand: Command = {
    id: 'ApiTest.UnsubscribeKeepAlive',
    label: 'unsubscribe(Coffee.ecore)'
};

/* SuperBrewer3000.coffee commands*/
export const GetModelCommand: Command = {
    id: 'ApiTest.GetModel.SuperBrewer3000',
    label: 'getModel(SuperBrewer3000.coffee)'
};

export const GetModelElementByIdCommand: Command = {
    id: 'ApiTest.GetModelElementById.SuperBrewer3000',
    label: 'getModelElementById(SuperBrewer3000.coffee, //@workflows.0)'
};

export const GetModelElementByNameCommand: Command = {
    id: 'ApiTest.GetModelElementByName.SuperBrewer3000',
    label: 'getModelElementByName(SuperBrewer3000.coffee, BrewingFlow)'
};

export const PatchCommand: Command = {
    id: 'ApiTest.Patch.SuperBrewer3000',
    label: 'patch(SuperBrewer3000.coffee)'
};

export const EditSetCommand: Command = {
    id: 'ApiTest.EditSet.SuperBrewer3000',
    label: 'edit(SuperBrewer3000.coffee,{type:set})'
};

export const EditAddCommand: Command = {
    id: 'ApiTest.EditAdd.SuperBrewer3000',
    label: 'edit(SuperBrewer3000.coffee,{type:add})'
};

export const EditRemoveCommand: Command = {
    id: 'ApiTest.EditRemove.SuperBrewer3000',
    label: 'edit(SuperBrewer3000.coffee,{type:remove})'
};

export const UndoCommand: Command = {
    id: 'ApiTest.Undo.SuperBrewer3000',
    label: 'undo(SuperBrewer3000.coffee)'
};

export const RedoCommand: Command = {
    id: 'ApiTest.Redo.SuperBrewer3000',
    label: 'redo(SuperBrewer3000.coffee)'
};

export const SaveCommand: Command = {
    id: 'ApiTest.Save.SuperBrewer3000',
    label: 'save(SuperBrewer3000.coffee)'
};

export const ValidationCommand: Command = {
    id: 'ApiTest.Validation.SuperBrewer3000',
    label: 'validate(SuperBrewer3000.coffee)'
};

export const ValidationMarkersCommand: Command = {
    id: 'ApiTest.ValidationMarkers.SuperBrewer3000',
    label: 'validateAndCreateMarkers(SuperBrewer3000.coffee)'
};

export const ValidationConstraintsCommand: Command = {
    id: 'ApiTest.ValidationConstraints.SuperBrewer3000',
    label: 'validationConstraints(SuperBrewer3000.coffee)'
};

export const SubscribeWithValidationCommand: Command = {
    id: 'ApiTest.SubscribeWithValidation.SuperBrewer3000',
    label: 'subscribeWithValidation(SuperBrewer3000.coffee)'
};

export const SubscribeCommand: Command = {
    id: 'ApiTest.Subscribe.SuperBrewer3000',
    label: 'subscribe(SuperBrewer3000.coffee)'
};

export const UnsubscribeCommand: Command = {
    id: 'ApiTest.Unsubscribe.SuperBrewer3000',
    label: 'unsubscribe(SuperBrewer3000.coffee)'
};

/* SuperBrewer3000.json commands */
export const GetModelSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.GetModel.SuperBrewer3000Json',
    label: 'getModel(SuperBrewer3000.json)'
};

export const GetModelElementByIdSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.GetModelElementById.SuperBrewer3000Json',
    label: 'getModelElementById(SuperBrewer3000.json, //@workflows.0)'
};

export const GetModelElementByNameSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.GetModelElementByName.SuperBrewer3000Json',
    label: 'getModelElementByName(SuperBrewer3000.json, Super Brewer 3000)'
};

export const EditSetSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.EditSet.SuperBrewer3000Json',
    label: 'edit(SuperBrewer3000.json,{type:set})'
};

export const EditAddSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.EditAdd.SuperBrewer3000Json',
    label: 'edit(SuperBrewer3000.json,{type:add})'
};

export const EditRemoveSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.EditRemove.SuperBrewer3000Json',
    label: 'edit(SuperBrewer3000.json,{type:remove})'
};

export const UpdateTaskNameSuperBrewer3000JsonCustomCommand: Command = {
    id: 'ApiTest.UpdateTaskName.SuperBrewer3000Json',
    label: 'edit(SuperBrewer3000.json,{type:updateTaskName},\'Coffee\')'
};

export const UndoSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.Undo.SuperBrewer3000Json',
    label: 'undo(SuperBrewer3000.json)'
};

export const RedoSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.Redo.SuperBrewer3000Json',
    label: 'redo(SuperBrewer3000.json)'
};

export const SaveSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.Save.SuperBrewer3000Json',
    label: 'save(SuperBrewer3000.json)'
};

export const ValidationSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.Validation.SuperBrewer3000Json',
    label: 'validate(SuperBrewer3000.json)'
};

export const ValidationMarkersSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.ValidationMarkers.SuperBrewer3000Json',
    label: 'validateAndCreateMarkers(SuperBrewer3000.json)'
};

export const ValidationConstraintsSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.ValidationConstraints.SuperBrewer3000Json',
    label: 'validationConstraints(SuperBrewer3000.json)'
};

export const SubscribeWithValidationSuperBrewer3000JsonCommand: Command = {
    id: 'ApiTest.SubscribeWithValidation.SuperBrewer3000Json',
    label: 'subscribeWithValidation(SuperBrewer3000.json)'
};

export const SubscribeWithTimeoutCommand: Command = {
    id: 'ApiTest.SubscribeWithTimeout',
    label: 'subscribeWithTimeout(SuperBrewer3000.json, 10000)'
};

export const KeepSubscriptionAliveCommand: Command = {
    id: 'ApiTest.KeepSubscriptionAlive',
    label: 'sendKeepAlive(SuperBrewer3000.json)'
};

export const UnsubscribeTimeoutCommand: Command = {
    id: 'ApiTest.UnsubscribeTimeout',
    label: 'unsubscribe(SuperBrewer3000.json)'
};

/* Custom commands */
export const CustomCounterAdd3: Command = {
    id: 'Coffee.Counter.Add3',
    label: 'counter(add, 3)'
};

export const CustomCounterAdd: Command = {
    id: 'Coffee.Counter.Add',
    label: 'counter(add)'
};

export const CustomCounterSubtract2: Command = {
    id: 'Coffee.Counter.Subtract',
    label: 'counter(subtract, 2)'
};

export const CustomCounterSubtract: Command = {
    id: 'Coffee.Count.Subtract',
    label: 'counter(subtract)'
};

export const CustomCounter: Command = {
    id: 'Coffee.Count',
    label: 'counter()'
};

/* ModelServer menu */
export const API_TEST_MENU = [...MAIN_MENU_BAR, '9_0_API_TEST_MENU'];
export const SERVER_SECTION = [...API_TEST_MENU, '1_API_TEST_MENU_SERVER_SECTION'];
export const GET_SECTION = [...API_TEST_MENU, '2_API_TEST_MENU_GET_SECTION'];
export const SAVE_SECTION = [...API_TEST_MENU, '3_API_TEST_MENU_SAVE_SECTION'];
export const SCHEMA_SECTION = [...API_TEST_MENU, '4_API_TEST_MENU_SCHEMA_SECTION'];

/* Coffee.ecore menu */
export const COFFEE_TEST_MENU = [...MAIN_MENU_BAR, '9_1_API_TEST_MENU_COFFEE'];
export const COFFEE_GET_SECTION = [...COFFEE_TEST_MENU, '1_API_MENU_COFFEE_GET_SECTION'];
export const COFFEE_EDIT_SECTION = [...COFFEE_TEST_MENU, '2_API_MENU_COFFEE_EDIT_SECTION'];
export const COFFEE_SAVE_SECTION = [...COFFEE_TEST_MENU, '3_API_MENU_COFFEE_SAVE_SECTION'];
export const COFFEE_VALIDATION_SECTION = [...COFFEE_TEST_MENU, '4_API_MENU_COFFEE_VALIDATION_SECTION'];
export const COFFEE_WEBSOCKET_SECTION = [...COFFEE_TEST_MENU, '5_API_MENU_COFFEE_WEBSOCKET_SECTION'];

/* SuperBrewer3000.coffee menu */
export const SUPERBREWER_TEST_MENU = [...MAIN_MENU_BAR, '9_2_API_TEST_MENU_SUPERBREWER'];
export const SUPERBREWER_GET_SECTION = [...SUPERBREWER_TEST_MENU, '1_API_MENU_SUPERBREWER_GET_SECTION'];
export const SUPERBREWER_EDIT_SECTION = [...SUPERBREWER_TEST_MENU, '2_API_MENU_SUPERBREWER_EDIT_SECTION'];
export const SUPERBREWER_SAVE_SECTION = [...SUPERBREWER_TEST_MENU, '3_API_MENU_SUPERBREWER_SAVE_SECTION'];
export const SUPERBREWER_VALIDATION_SECTION = [...SUPERBREWER_TEST_MENU, '4_API_MENU_SUPERBREWER_VALIDATION_SECTION'];
export const SUPERBREWER_WEBSOCKET_SECTION = [...SUPERBREWER_TEST_MENU, '5_API_MENU_SUPERBREWER_WEBSOCKET_SECTION'];

/* SuperBrewer3000.json menu */
export const SUPERBREWER_JSON_TEST_MENU = [...MAIN_MENU_BAR, '9_3_API_TEST_MENU_SUPERBREWER_JSON'];
export const SUPERBREWER_JSON_GET_SECTION = [...SUPERBREWER_JSON_TEST_MENU, '1_API_MENU_SUPERBREWER_JSON_GET_SECTION'];
export const SUPERBREWER_JSON_EDIT_SECTION = [...SUPERBREWER_JSON_TEST_MENU, '2_API_MENU_SUPERBREWER_JSON_EDIT_SECTION'];
export const SUPERBREWER_JSON_SAVE_SECTION = [...SUPERBREWER_JSON_TEST_MENU, '3_API_MENU_SUPERBREWER_JSON_SAVE_SECTION'];
export const SUPERBREWER_JSON_VALIDATION_SECTION = [...SUPERBREWER_JSON_TEST_MENU, '4_API_MENU_SUPERBREWER_JSON_VALIDATION_SECTION'];
export const SUPERBREWER_JSON_WEBSOCKET_SECTION = [...SUPERBREWER_JSON_TEST_MENU, '5_API_MENU_SUPERBREWER_JSON_WEBSOCKET_SECTION'];

/* Custom menu */
export const CUSTOM_TEST_MENU = [...MAIN_MENU_BAR, '9_4_API_TEST_MENU_CUSTOM'];
export const CUSTOM_TEST_COUNTER_SECTION = [...CUSTOM_TEST_MENU, '1_COUNTER'];

const superBrewer3000JsonPatch = {
    'eClass':
        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Machine',
    'children': [
        {
            'eClass':
                'http://www.eclipsesource.com/modelserver/example/coffeemodel#//BrewingUnit'
        },
        {
            'eClass':
                'http://www.eclipsesource.com/modelserver/example/coffeemodel#//ControlUnit',
            'processor': {
                'clockSpeed': 50,
                'numberOfCores': 20,
                'socketconnectorType': 'Z51',
                'thermalDesignPower': 200
            },
            'display': {
                'width': 50,
                'height': 50
            }
        }
    ],
    'name': 'Super Brewer 5000',
    'workflows': [
        {
            'nodes': [
                {
                    'eClass':
                        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//AutomaticTask',
                    'name': 'PreHeat',
                    'component': {
                        'eClass':
                            'http://www.eclipsesource.com/modelserver/example/coffeemodel#//BrewingUnit',
                        '$ref': '//@children.0'
                    }
                }
            ]
        }
    ]
};

@injectable()
export class ApiTestMenuContribution implements MenuContribution, CommandContribution {

    @inject(MessageService) protected readonly messageService: MessageService;
    @inject(DevModelServerClient) protected readonly modelServerClient: DevModelServerClient;
    @inject(ModelServerSubscriptionService) protected readonly modelServerSubscriptionService: ModelServerSubscriptionService;
    @inject(DiagnosticManager) protected readonly diagnosticManager: DiagnosticManager;

    private workspaceUri: string;

    constructor(@inject(WorkspaceService) protected readonly workspaceService: WorkspaceService) {
        workspaceService.onWorkspaceChanged(workspace => {
            if (workspace[0] && workspace[0].resource) {
                this.workspaceUri = workspace[0].resource.toString().replace('file://', 'file:');
            }
        });
    }

    @postConstruct()
    init(): void {
        this.initializeWebSocketListener();
    }

    registerCommands(commands: CommandRegistry): void {
        /* ModelServer commands */
        commands.registerCommand(PingCommand, {
            execute: () => {
                this.modelServerClient
                    .ping()
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetAllCommand, {
            execute: () => {
                this.modelServerClient
                    .getAll()
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelUrisCommand, {
            execute: () => {
                this.modelServerClient
                    .getModelUris()
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(SaveAllCommand, {
            execute: () => {
                this.modelServerClient
                    .saveAll()
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetTypeSchemaCommand, {
            execute: () => {
                this.modelServerClient
                    .getTypeSchema('Coffee.ecore')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetUiSchemaCommand, {
            execute: () => {
                this.modelServerClient.getUiSchema('controlunit').then((response: any) => this.messageService.info(printResponse(response)));
            }
        });

        /* SuperBrewer3000.coffee commands */
        commands.registerCommand(GetModelCommand, {
            execute: () => {
                this.modelServerClient
                    .get('SuperBrewer3000.coffee')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelElementByIdCommand, {
            execute: () => {
                this.modelServerClient
                    .getElementById('SuperBrewer3000.coffee', '//@workflows.0')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelElementByNameCommand, {
            execute: () => {
                this.modelServerClient
                    .getElementByName('SuperBrewer3000.coffee', 'BrewingFlow')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(EditSetCommand, {
            execute: () => {
                const owner = {
                    'eClass':
                        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//AutomaticTask',
                    '$ref':
                        `${this.workspaceUri}/SuperBrewer3000.coffee#//@workflows.0/@nodes.0`
                };
                const feature = 'name';
                const changedValues = ['Auto Brew'];
                const setCommand = new SetCommand(owner, feature, changedValues);
                this.modelServerClient
                    .edit('SuperBrewer3000.coffee', setCommand)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(EditRemoveCommand, {
            execute: () => {
                const owner = {
                    'eClass':
                        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Workflow',
                    '$ref':
                        `${this.workspaceUri}/SuperBrewer3000.coffee#//@workflows.0`
                };
                const feature = 'nodes';
                const indices = [0];
                const removeCommand = new RemoveCommand(owner, feature, indices);
                this.modelServerClient
                    .edit('SuperBrewer3000.coffee', removeCommand)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(EditAddCommand, {
            execute: () => {
                const owner = {
                    'eClass':
                        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Workflow',
                    '$ref':
                        `${this.workspaceUri}/SuperBrewer3000.coffee#//@workflows.0`
                };
                const feature = 'nodes';
                const toAdd = [{ eClass: 'http://www.eclipsesource.com/modelserver/example/coffeemodel#//AutomaticTask' }];
                const addCommand = new AddCommand(owner, feature, toAdd);
                this.modelServerClient
                    .edit('SuperBrewer3000.coffee', addCommand)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(PatchCommand, {
            execute: () => {
                this.modelServerClient
                    .update('SuperBrewer3000.coffee', superBrewer3000JsonPatch)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(UndoCommand, {
            execute: () => {
                this.modelServerClient
                    .undo('SuperBrewer3000.coffee')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(RedoCommand, {
            execute: () => {
                this.modelServerClient
                    .redo('SuperBrewer3000.coffee')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(SaveCommand, {
            execute: () => {
                this.modelServerClient
                    .save('SuperBrewer3000.coffee')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(ValidationCommand, {
            execute: () => {
                this.modelServerClient
                    .validation('SuperBrewer3000.coffee')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(ValidationMarkersCommand, {
            execute: () => {
                this.modelServerClient
                    .validation('SuperBrewer3000.coffee')
                    .then((response: any) => {
                        const message = createMarkersFromResponseBody(this.diagnosticManager, new URI('SuperBrewer3000.coffee'), response);
                        this.messageService.info(message);
                    });
            }
        });
        commands.registerCommand(ValidationConstraintsCommand, {
            execute: () => {
                this.modelServerClient
                    .validationConstraints('SuperBrewer3000.coffee')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(SubscribeCommand, {
            execute: () => {
                this.modelServerClient.subscribe('SuperBrewer3000.coffee');
            }
        });
        commands.registerCommand(SubscribeWithValidationCommand, {
            execute: () => {
                this.modelServerClient.subscribeWithValidation('SuperBrewer3000.coffee');
            }
        });
        commands.registerCommand(UnsubscribeCommand, {
            execute: () => {
                this.modelServerClient.unsubscribe('SuperBrewer3000.coffee');
            }
        });

        /* Coffee.ecore commands */
        commands.registerCommand(GetModelCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .get('Coffee.ecore')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelXmiCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .get('Coffee.ecore', 'xmi')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelElementByIdCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .getElementById('Coffee.ecore', '//@eClassifiers.2')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelElementByIdXmiCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .getElementById('Coffee.ecore', '//@eClassifiers.2', 'xmi')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelElementByNameCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .getElementByName('Coffee.ecore', 'Machine')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelElementByNameXmiCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .getElementByName('Coffee.ecore', 'Machine', 'xmi')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(EditCompoundCoffeeEcoreCommand, {
            execute: () => {
                const ownerA = {
                    'eClass':
                        'http://www.eclipse.org/emf/2002/Ecore#//EClass',
                    '$ref':
                        `${this.workspaceUri}/Coffee.ecore#//@eClassifiers.2`
                };
                const featureA = 'name';
                const changedValuesA = ['ControlUnitNew'];
                const setCommandA = new SetCommand(ownerA, featureA, changedValuesA);

                const ownerB = {
                    'eClass':
                        'http://www.eclipse.org/emf/2002/Ecore#//EClass',
                    '$ref':
                        `${this.workspaceUri}/Coffee.ecore#//@eClassifiers.5`
                };
                const featureB = 'name';
                const changedValuesB = ['WaterTankNew'];
                const setCommandB = new SetCommand(ownerB, featureB, changedValuesB);

                const compoundCommand = new CompoundCommand([setCommandA, setCommandB]);

                this.modelServerClient
                    .edit('Coffee.ecore', compoundCommand)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(EditSetCoffeeEcoreCommand, {
            execute: () => {
                const owner = {
                    'eClass':
                        'http://www.eclipse.org/emf/2002/Ecore#//EClass',
                    '$ref':
                        `${this.workspaceUri}/Coffee.ecore#//@eClassifiers.2`
                };
                const feature = 'name';
                const changedValues = ['ControlUnitNew'];
                const setCommand = new SetCommand(owner, feature, changedValues);
                this.modelServerClient
                    .edit('Coffee.ecore', setCommand)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(EditRemoveCoffeeEcoreCommand, {
            execute: () => {
                const owner = {
                    'eClass':
                        'http://www.eclipse.org/emf/2002/Ecore#//EPackage',
                    '$ref':
                        `${this.workspaceUri}/Coffee.ecore#/`
                };
                const feature = 'eClassifiers';
                const indices = [5];
                const removeCommand = new RemoveCommand(owner, feature, indices);
                this.modelServerClient
                    .edit('Coffee.ecore', removeCommand)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(EditAddCoffeeEcoreCommand, {
            execute: () => {
                const owner = {
                    'eClass':
                        'http://www.eclipse.org/emf/2002/Ecore#//EPackage',
                    '$ref':
                        `${this.workspaceUri}/Coffee.ecore#/`
                };
                const feature = 'eClassifiers';
                const toAdd = [{ eClass: 'http://www.eclipse.org/emf/2002/Ecore#//EClass', name: 'NewEClassifier' }];
                const addCommand = new AddCommand(owner, feature, toAdd);
                this.modelServerClient
                    .edit('Coffee.ecore', addCommand)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(UndoCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .undo('Coffee.ecore')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(RedoCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .redo('Coffee.ecore')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(SaveCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .save('Coffee.ecore')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(ValidationCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .validation('Coffee.ecore')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(ValidationMarkersCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .validation('Coffee.ecore')
                    .then((response: any) => {
                        const message = createMarkersFromResponseBody(this.diagnosticManager, new URI('Coffee.ecore'), response);
                        this.messageService.info(message);
                    });
            }
        });
        commands.registerCommand(ValidationConstraintsCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient
                    .validationConstraints('Coffee.ecore')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(SubscribeWithValidationCoffeeEcoreCommand, {
            execute: () => {
                this.modelServerClient.subscribeWithValidation('Coffee.ecore');
            }
        });
        commands.registerCommand(SubscribeAndKeepAliveCommand, {
            execute: () => {
                this.modelServerClient.subscribeWithTimeout('Coffee.ecore', 60000);
            }
        });
        commands.registerCommand(SubscribeAndKeepAliveXmiCommand, {
            execute: () => {
                this.modelServerClient.subscribeWithTimeoutAndFormat('Coffee.ecore', 60000, 'xmi');
            }
        });
        commands.registerCommand(UnsubscribeKeepAliveCommand, {
            execute: () => {
                this.modelServerClient.unsubscribe('Coffee.ecore');
            }
        });

        /* SuperBrewer3000.json commands */
        commands.registerCommand(GetModelSuperBrewer3000JsonCommand, {
            execute: () => {
                this.modelServerClient
                    .get('SuperBrewer3000.json')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelElementByIdSuperBrewer3000JsonCommand, {
            execute: () => {
                this.modelServerClient
                    .getElementById('SuperBrewer3000.json', '//@workflows.0')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelElementByNameSuperBrewer3000JsonCommand, {
            execute: () => {
                this.modelServerClient
                    .getElementByName('SuperBrewer3000.json', 'Super Brewer 3000')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(EditSetSuperBrewer3000JsonCommand, {
            execute: () => {
                const owner = {
                    'eClass':
                        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//AutomaticTask',
                    '$ref':
                        `${this.workspaceUri}/SuperBrewer3000.json#//@workflows.0/@nodes.0`
                };
                const feature = 'name';
                const changedValues = ['Auto Brew'];
                const setCommand = new SetCommand(owner, feature, changedValues);
                this.modelServerClient
                    .edit('SuperBrewer3000.json', setCommand)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(EditRemoveSuperBrewer3000JsonCommand, {
            execute: () => {
                const owner = {
                    'eClass':
                        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Workflow',
                    '$ref':
                        `${this.workspaceUri}/SuperBrewer3000.json#//@workflows.0`
                };
                const feature = 'nodes';
                const indices = [0];
                const removeCommand = new RemoveCommand(owner, feature, indices);
                this.modelServerClient
                    .edit('SuperBrewer3000.json', removeCommand)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(EditAddSuperBrewer3000JsonCommand, {
            execute: () => {
                const owner = {
                    'eClass':
                        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Workflow',
                    '$ref':
                        `${this.workspaceUri}/SuperBrewer3000.json#//@workflows.0`
                };
                const feature = 'nodes';
                const toAdd = [{ eClass: 'http://www.eclipsesource.com/modelserver/example/coffeemodel#//AutomaticTask' }];
                const addCommand = new AddCommand(owner, feature, toAdd);
                this.modelServerClient
                    .edit('SuperBrewer3000.json', addCommand)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(UpdateTaskNameSuperBrewer3000JsonCustomCommand, {
            execute: () => {
                const updateTaskName = new UpdateTaskNameCommand('Coffee');
                this.modelServerClient.edit('SuperBrewer3000.json', updateTaskName)
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(UndoSuperBrewer3000JsonCommand, {
            execute: () => {
                this.modelServerClient
                    .undo('SuperBrewer3000.json')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(RedoSuperBrewer3000JsonCommand, {
            execute: () => {
                this.modelServerClient
                    .redo('SuperBrewer3000.json')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(SaveSuperBrewer3000JsonCommand, {
            execute: () => {
                this.modelServerClient
                    .save('SuperBrewer3000.json')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(ValidationSuperBrewer3000JsonCommand, {
            execute: () => {
                this.modelServerClient
                    .validation('SuperBrewer3000.json')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(ValidationMarkersSuperBrewer3000JsonCommand, {
            execute: () => {
                this.modelServerClient
                    .validation('SuperBrewer3000.json')
                    .then((response: any) => {
                        const message = createMarkersFromResponseBody(this.diagnosticManager, new URI('SuperBrewer3000.json'), response);
                        this.messageService.info(message);
                    });
            }
        });
        commands.registerCommand(ValidationConstraintsSuperBrewer3000JsonCommand, {
            execute: () => {
                this.modelServerClient
                    .validationConstraints('SuperBrewer3000.json')
                    .then((response: any) => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(SubscribeWithValidationSuperBrewer3000JsonCommand, {
            execute: () => {
                this.modelServerClient.subscribeWithValidation('SuperBrewer3000.json');
            }
        });
        commands.registerCommand(SubscribeWithTimeoutCommand, {
            execute: () => {
                this.modelServerClient.subscribeWithTimeout('SuperBrewer3000.json', 10000);
            }
        });
        commands.registerCommand(KeepSubscriptionAliveCommand, {
            execute: () => {
                this.modelServerClient.sendKeepAlive('SuperBrewer3000.json');
            }
        });
        commands.registerCommand(UnsubscribeTimeoutCommand, {
            execute: () => {
                this.modelServerClient.unsubscribe('SuperBrewer3000.json');
            }
        });

        commands.registerCommand(CustomCounterAdd3, {
            execute: () => this.modelServerClient.counter('add', 3).then((response: any) => this.messageService.info(printResponse(response)))
        });
        commands.registerCommand(CustomCounterAdd, {
            execute: () => this.modelServerClient.counter('add', undefined).then((response: any) => this.messageService.info(printResponse(response)))
        });
        commands.registerCommand(CustomCounterSubtract2, {
            execute: () => this.modelServerClient.counter('subtract', 2).then((response: any) => this.messageService.info(printResponse(response)))
        });
        commands.registerCommand(CustomCounterSubtract, {
            execute: () => this.modelServerClient.counter('subtract', undefined).then((response: any) => this.messageService.info(printResponse(response)))
        });
        commands.registerCommand(CustomCounter, {
            execute: () => this.modelServerClient.counter(undefined, undefined).then((response: any) => this.messageService.info(printResponse(response)))
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        /* ModelServer */
        menus.registerSubmenu(API_TEST_MENU, 'ModelServer');

        menus.registerMenuAction(SERVER_SECTION, { commandId: PingCommand.id });

        menus.registerMenuAction(GET_SECTION, { commandId: GetModelUrisCommand.id, order: 'a' });
        menus.registerMenuAction(GET_SECTION, { commandId: GetAllCommand.id, order: 'b' });

        menus.registerMenuAction(SAVE_SECTION, { commandId: SaveAllCommand.id });

        menus.registerMenuAction(SCHEMA_SECTION, { commandId: GetTypeSchemaCommand.id });
        menus.registerMenuAction(SCHEMA_SECTION, { commandId: GetUiSchemaCommand.id });

        /* Coffee.ecore */
        menus.registerSubmenu(COFFEE_TEST_MENU, 'Coffee.ecore');

        menus.registerMenuAction(COFFEE_GET_SECTION, { commandId: GetModelCoffeeEcoreCommand.id, order: 'a' });
        menus.registerMenuAction(COFFEE_GET_SECTION, { commandId: GetModelXmiCoffeeEcoreCommand.id, order: 'b' });
        menus.registerMenuAction(COFFEE_GET_SECTION, { commandId: GetModelElementByIdCoffeeEcoreCommand.id, order: 'c' });
        menus.registerMenuAction(COFFEE_GET_SECTION, { commandId: GetModelElementByIdXmiCoffeeEcoreCommand.id, order: 'd' });
        menus.registerMenuAction(COFFEE_GET_SECTION, { commandId: GetModelElementByNameCoffeeEcoreCommand.id, order: 'e' });
        menus.registerMenuAction(COFFEE_GET_SECTION, { commandId: GetModelElementByNameXmiCoffeeEcoreCommand.id, order: 'f' });

        menus.registerMenuAction(COFFEE_EDIT_SECTION, { commandId: EditCompoundCoffeeEcoreCommand.id });
        menus.registerMenuAction(COFFEE_EDIT_SECTION, { commandId: EditSetCoffeeEcoreCommand.id });
        menus.registerMenuAction(COFFEE_EDIT_SECTION, { commandId: EditRemoveCoffeeEcoreCommand.id });
        menus.registerMenuAction(COFFEE_EDIT_SECTION, { commandId: EditAddCoffeeEcoreCommand.id });

        menus.registerMenuAction(COFFEE_SAVE_SECTION, { commandId: SaveCoffeeEcoreCommand.id });
        menus.registerMenuAction(COFFEE_SAVE_SECTION, { commandId: UndoCoffeeEcoreCommand.id });
        menus.registerMenuAction(COFFEE_SAVE_SECTION, { commandId: RedoCoffeeEcoreCommand.id });

        menus.registerMenuAction(COFFEE_VALIDATION_SECTION, { commandId: ValidationCoffeeEcoreCommand.id });
        menus.registerMenuAction(COFFEE_VALIDATION_SECTION, { commandId: ValidationMarkersCoffeeEcoreCommand.id });
        menus.registerMenuAction(COFFEE_VALIDATION_SECTION, { commandId: ValidationConstraintsCoffeeEcoreCommand.id });

        menus.registerMenuAction(COFFEE_WEBSOCKET_SECTION, { commandId: SubscribeAndKeepAliveCommand.id });
        menus.registerMenuAction(COFFEE_WEBSOCKET_SECTION, { commandId: SubscribeWithValidationCoffeeEcoreCommand.id });
        menus.registerMenuAction(COFFEE_WEBSOCKET_SECTION, { commandId: SubscribeAndKeepAliveXmiCommand.id });
        menus.registerMenuAction(COFFEE_WEBSOCKET_SECTION, { commandId: UnsubscribeKeepAliveCommand.id });

        /* SuperBrewer3000.coffee */
        menus.registerSubmenu(SUPERBREWER_TEST_MENU, 'SuperBrewer3000.coffee');

        menus.registerMenuAction(SUPERBREWER_GET_SECTION, { commandId: GetModelCommand.id, order: 'a' });
        menus.registerMenuAction(SUPERBREWER_GET_SECTION, { commandId: GetModelElementByIdCommand.id, order: 'b' });
        menus.registerMenuAction(SUPERBREWER_GET_SECTION, { commandId: GetModelElementByNameCommand.id, order: 'c' });

        menus.registerMenuAction(SUPERBREWER_EDIT_SECTION, { commandId: EditSetCommand.id });
        menus.registerMenuAction(SUPERBREWER_EDIT_SECTION, { commandId: EditRemoveCommand.id });
        menus.registerMenuAction(SUPERBREWER_EDIT_SECTION, { commandId: EditAddCommand.id });
        menus.registerMenuAction(SUPERBREWER_EDIT_SECTION, { commandId: PatchCommand.id });

        menus.registerMenuAction(SUPERBREWER_SAVE_SECTION, { commandId: SaveCommand.id });
        menus.registerMenuAction(SUPERBREWER_SAVE_SECTION, { commandId: UndoCommand.id });
        menus.registerMenuAction(SUPERBREWER_SAVE_SECTION, { commandId: RedoCommand.id });

        menus.registerMenuAction(SUPERBREWER_VALIDATION_SECTION, { commandId: ValidationCommand.id });
        menus.registerMenuAction(SUPERBREWER_VALIDATION_SECTION, { commandId: ValidationMarkersCommand.id });
        menus.registerMenuAction(SUPERBREWER_VALIDATION_SECTION, { commandId: ValidationConstraintsCommand.id });

        menus.registerMenuAction(SUPERBREWER_WEBSOCKET_SECTION, { commandId: SubscribeCommand.id });
        menus.registerMenuAction(SUPERBREWER_WEBSOCKET_SECTION, { commandId: SubscribeWithValidationCommand.id });
        menus.registerMenuAction(SUPERBREWER_WEBSOCKET_SECTION, { commandId: UnsubscribeCommand.id });

        /* SuperBrewer3000.json */
        menus.registerSubmenu(SUPERBREWER_JSON_TEST_MENU, 'SuperBrewer3000.json');

        menus.registerMenuAction(SUPERBREWER_JSON_GET_SECTION, { commandId: GetModelSuperBrewer3000JsonCommand.id, order: 'a' });
        menus.registerMenuAction(SUPERBREWER_JSON_GET_SECTION, { commandId: GetModelElementByIdSuperBrewer3000JsonCommand.id, order: 'b' });
        menus.registerMenuAction(SUPERBREWER_JSON_GET_SECTION, { commandId: GetModelElementByNameSuperBrewer3000JsonCommand.id, order: 'c' });

        menus.registerMenuAction(SUPERBREWER_JSON_EDIT_SECTION, { commandId: EditSetSuperBrewer3000JsonCommand.id });
        menus.registerMenuAction(SUPERBREWER_JSON_EDIT_SECTION, { commandId: EditRemoveSuperBrewer3000JsonCommand.id });
        menus.registerMenuAction(SUPERBREWER_JSON_EDIT_SECTION, { commandId: EditAddSuperBrewer3000JsonCommand.id });
        menus.registerMenuAction(SUPERBREWER_JSON_EDIT_SECTION, { commandId: UpdateTaskNameSuperBrewer3000JsonCustomCommand.id });

        menus.registerMenuAction(SUPERBREWER_JSON_SAVE_SECTION, { commandId: SaveSuperBrewer3000JsonCommand.id });
        menus.registerMenuAction(SUPERBREWER_JSON_SAVE_SECTION, { commandId: UndoSuperBrewer3000JsonCommand.id });
        menus.registerMenuAction(SUPERBREWER_JSON_SAVE_SECTION, { commandId: RedoSuperBrewer3000JsonCommand.id });

        menus.registerMenuAction(SUPERBREWER_JSON_VALIDATION_SECTION, { commandId: ValidationSuperBrewer3000JsonCommand.id });
        menus.registerMenuAction(SUPERBREWER_JSON_VALIDATION_SECTION, { commandId: ValidationMarkersSuperBrewer3000JsonCommand.id });
        menus.registerMenuAction(SUPERBREWER_JSON_VALIDATION_SECTION, { commandId: ValidationConstraintsSuperBrewer3000JsonCommand.id });

        menus.registerMenuAction(SUPERBREWER_JSON_WEBSOCKET_SECTION, { commandId: SubscribeWithTimeoutCommand.id, order: 'a' });
        menus.registerMenuAction(SUPERBREWER_JSON_WEBSOCKET_SECTION, { commandId: SubscribeWithValidationSuperBrewer3000JsonCommand.id, order: 'b' });
        menus.registerMenuAction(SUPERBREWER_JSON_WEBSOCKET_SECTION, { commandId: KeepSubscriptionAliveCommand.id, order: 'c' });
        menus.registerMenuAction(SUPERBREWER_JSON_WEBSOCKET_SECTION, { commandId: UnsubscribeTimeoutCommand.id, order: 'd' });

        menus.registerSubmenu(CUSTOM_TEST_MENU, 'Custom');
        menus.registerMenuAction(CUSTOM_TEST_COUNTER_SECTION, { commandId: CustomCounterAdd3.id, order: 'a' });
        menus.registerMenuAction(CUSTOM_TEST_COUNTER_SECTION, { commandId: CustomCounterAdd.id, order: 'b' });
        menus.registerMenuAction(CUSTOM_TEST_COUNTER_SECTION, { commandId: CustomCounterSubtract2.id, order: 'c' });
        menus.registerMenuAction(CUSTOM_TEST_COUNTER_SECTION, { commandId: CustomCounterSubtract.id, order: 'd' });
        menus.registerMenuAction(CUSTOM_TEST_COUNTER_SECTION, { commandId: CustomCounter.id, order: 'e' });
    }

    private initializeWebSocketListener(clearIntervalId = false): void {
        this.modelServerSubscriptionService.onOpenListener((response: ModelServerResponse) => {
            this.showSocketInfo('Subscription opened!', response.modelUri);
        });
        this.modelServerSubscriptionService.onDirtyStateListener((response: ModelServerMessage) => {
            this.showSocketInfo(`DirtyState ${response.data}`, response.modelUri);
        });
        this.modelServerSubscriptionService.onIncrementalUpdateListener((response: ModelServerMessage) => {
            const data = response.data;
            // show-case type casting from server data
            if (CommandExecutionResult.is(data)) {
                console.log(`Incremental update due to command execution: Reason '${data.type}' based on command '${data.source.type}'`);
            }
            this.showSocketInfo(`IncrementalUpdate ${JSON.stringify(response.data)}`, response.modelUri);
        });
        this.modelServerSubscriptionService.onFullUpdateListener((response: ModelServerMessage) => {
            this.showSocketInfo(`FullUpdate ${JSON.stringify(response.data)}`, response.modelUri);
        });
        this.modelServerSubscriptionService.onSuccessListener((response: ModelServerMessage) => {
            this.showSocketInfo(`Success ${response.data}`, response.modelUri);
        });
        this.modelServerSubscriptionService.onUnknownMessageListener((response: ModelServerMessage) => {
            this.showSocketWarning(`Unknown Message ${JSON.stringify(response.data)}`, response.modelUri);
        });
        this.modelServerSubscriptionService.onClosedListener((response: ModelServerMessage) => {
            this.showSocketInfo(`Subscription closed! Reason: ${response.data}`, response.modelUri);
        });
        this.modelServerSubscriptionService.onErrorListener((response: ModelServerMessage) => {
            this.showSocketError(`Error! ${JSON.stringify(response.data)}`, response.modelUri);
        });
        this.modelServerSubscriptionService.onValidationResultListener((response: ModelServerMessage) => {
            this.showSocketInfo(`Validation result ${JSON.stringify(response.data)}`, response.modelUri);
        });
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

function printResponse(response: Response<any>): string {
    const now = new Date(Date.now());
    return `${now.toISOString()} | [REST Response]: StatusCode: ${response.statusCode}
            StatusMessage: ${response.statusMessage}
            Body: ${response.body ? JSON.stringify(response.body) : 'undefined'}`;
}

/**
 * Create the markers in the problem view
 * @param diagnosticManager the diagnostic manager
 * @param modelURI the concerned model URI
 * @param response the validation response
 * @returns the message to log
 */
function createMarkersFromResponseBody(diagnosticManager: DiagnosticManager, modelURI: URI, response: Response<any>): string {
    // print markers in Problems view
    const diagnostic = response.body as Diagnostic;
    diagnosticManager.setDiagnostic(modelURI, diagnostic);
    const level = Diagnostic.getSeverityLabel(diagnostic);
    if (level === 'OK') {
        return `Validation is ${level}. There should be no new marker in Problems view.`;
    } else {
        return `Look for ${level} markers in Problems view.`;
    }
}
