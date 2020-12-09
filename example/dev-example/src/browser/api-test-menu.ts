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
import { ModelServerSubscriptionService } from '@eclipse-emfcloud/modelserver-theia/lib/browser';
import {
    ModelServerClient,
    ModelServerCommand,
    ModelServerCommandUtil,
    Response
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
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { inject, injectable } from 'inversify';

export const PingCommand: Command = {
    id: 'ApiTest.Ping',
    label: 'ping()'
};

export const GetModelCommand: Command = {
    id: 'ApiTest.GetModel',
    label: 'getModel(SuperBrewer3000.coffee)'
};

export const GetAllCommand: Command = {
    id: 'ApiTest.GetAll',
    label: 'getAll()'
};

export const GetModelUrisCommand: Command = {
    id: 'ApiTest.GetModelUris',
    label: 'getModelUris()'
};

export const PatchCommand: Command = {
    id: 'ApiTest.Patch',
    label: 'patch(SuperBrewer3000.coffee)'
};

export const SubscribeCommand: Command = {
    id: 'ApiTest.Subscribe',
    label: 'subscribe(SuperBrewer3000.coffee)'
};

export const UnsubscribeCommand: Command = {
    id: 'ApiTest.Unsubscribe',
    label: 'unsubscribe(SuperBrewer3000.coffee)'
};

export const SubscribeAndKeepAliveCommand: Command = {
    id: 'ApiTest.SubscribeAndKeepAlive',
    label: 'subscribeAndKeepAlive(Coffee.ecore, 60000)'
};

export const UnsubscribeKeepAliveCommand: Command = {
    id: 'ApiTest.UnsubscribeKeepAlive',
    label: 'unsubscribe(Coffee.ecore)'
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

export const EditSetCommand: Command = {
    id: 'ApiTest.EditSet',
    label: 'edit(SuperBrewer3000.coffee,{type:set})'
};

export const EditAddCommand: Command = {
    id: 'ApiTest.EditAdd',
    label: 'edit(SuperBrewer3000.coffee,{type:add})'
};

export const EditRemoveCommand: Command = {
    id: 'ApiTest.EditRemove',
    label: 'edit(SuperBrewer3000.coffee,{type:remove})'
};

export const SaveCommand: Command = {
    id: 'ApiTest.Save',
    label: 'save(SuperBrewer3000.coffee)'
};

export const GetTypeSchemaCommand: Command = {
    id: 'ApiTest.GetTypeSchema',
    label: 'getTypeSchema(Coffee.ecore)'
};

export const GetUiSchemaCommand: Command = {
    id: 'ApiTest.GetUiSchema',
    label: 'getUiSchema(ControlUnitView)'
};

export const GetModelElementByIdCommand: Command = {
    id: 'ApiTest.GetModelElementById',
    label: 'getModelElementById(SuperBrewer3000.coffee, //@workflows.0)'
};

export const GetModelElementByNameCommand: Command = {
    id: 'ApiTest.GetModelElementByName',
    label: 'getModelElementByName(SuperBrewer3000.coffee, BrewingFlow)'
};

export const API_TEST_MENU = [...MAIN_MENU_BAR, '9_API_TEST_MENU'];
export const SERVER_SECTION = [...API_TEST_MENU, '1_API_TEST_MENU_SERVER_SECTION'];
export const PING = [...SERVER_SECTION, PingCommand.label];

export const GET_SECTION = [...API_TEST_MENU, '2_API_TEST_MENU_GET_SECTION'];
export const GET_MODEL = [...GET_SECTION, GetModelCommand.label];
export const GET_ALL = [...GET_SECTION, GetAllCommand.label];
export const GET_MODEL_URIS = [...GET_SECTION, GetModelUrisCommand.label];
export const GET_ELEMENTBYID = [...GET_SECTION, GetModelElementByIdCommand.label];
export const GET_ELEMENTBYNAME = [...GET_SECTION, GetModelElementByNameCommand.label];

export const EDIT_SECTION = [...API_TEST_MENU, '3_API_TEST_MENU_EDIT_SECTION'];
export const EDIT_SET = [...EDIT_SECTION, EditSetCommand.label];
export const EDIT_REMOVE = [...EDIT_SECTION, EditRemoveCommand.label];
export const EDIT_ADD = [...EDIT_SECTION, EditAddCommand.label];
export const PATCH = [...API_TEST_MENU, PatchCommand.label];

export const SAVE_SECTION = [...API_TEST_MENU, '4_API_TEST_MENU_SAVE_SECTION'];
export const SAVE = [...SAVE_SECTION, SaveCommand.label];

export const SCHEMA_SECTION = [...API_TEST_MENU, '5_API_TEST_MENU_SCHEMA_SECTION'];
export const GET_TYPESCHEMA = [...SCHEMA_SECTION, GetTypeSchemaCommand.label];
export const GET_UISCHEMA = [...SCHEMA_SECTION, GetUiSchemaCommand.label];

export const WEBSOCKET_SECTION = [...API_TEST_MENU, '6_API_TEST_MENU_WEBSOCKET_SECTION'];
export const SUBSCRIBE = [...WEBSOCKET_SECTION, SubscribeCommand.label];
export const UNSUBSCRIBE = [...WEBSOCKET_SECTION, UnsubscribeCommand.label];
export const SUBSCRIBE_KEEPALIVE = [...WEBSOCKET_SECTION, SubscribeAndKeepAliveCommand.label];
export const UNSUBSCRIBE_COFFEE = [...WEBSOCKET_SECTION, UnsubscribeKeepAliveCommand.label];
export const SUBSCRIBE_TIMEOUT = [...WEBSOCKET_SECTION, SubscribeWithTimeoutCommand.label];
export const KEEPALIVE = [...WEBSOCKET_SECTION, KeepSubscriptionAliveCommand.label];
export const UNSUBSCRIBE_TIMEOUT = [...WEBSOCKET_SECTION, UnsubscribeTimeoutCommand.label];

const exampleFilePatch = {
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
    @inject(ModelServerClient) protected readonly modelServerClient: ModelServerClient;
    @inject(ModelServerSubscriptionService) protected readonly modelServerSubscriptionService: ModelServerSubscriptionService;

    private workspaceUri: string;
    private intervalId: NodeJS.Timeout;

    constructor(@inject(WorkspaceService) protected readonly workspaceService: WorkspaceService) {
        workspaceService.onWorkspaceChanged(e => {
            if (e[0] && e[0].uri) {
                this.workspaceUri = e[0].uri.replace('file://', 'file:');
            }
        });
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(PingCommand, {
            execute: () => {
                this.modelServerClient
                    .ping()
                    .then(response => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelCommand, {
            execute: () => {
                this.modelServerClient
                    .get('SuperBrewer3000.coffee')
                    .then(response => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetAllCommand, {
            execute: () => {
                this.modelServerClient
                    .getAll()
                    .then(response => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(GetModelUrisCommand, {
            execute: () => {
                this.modelServerClient
                    .getModelUris()
                    .then(response => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(PatchCommand, {
            execute: () => {
                this.modelServerClient
                    .update('SuperBrewer3000.coffee', exampleFilePatch)
                    .then(response => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(SubscribeCommand, {
            execute: () => {
                this.initializeWebSocket();
                this.modelServerClient.subscribe('SuperBrewer3000.coffee');
            }
        });
        commands.registerCommand(UnsubscribeCommand, {
            execute: () => {
                this.modelServerClient.unsubscribe('SuperBrewer3000.coffee');
            }
        });
        commands.registerCommand(SubscribeAndKeepAliveCommand, {
            execute: () => {
                this.initializeWebSocket(true);
                this.modelServerClient.subscribeWithTimeout('Coffee.ecore', 60000);
                this.intervalId = setInterval(() => this.modelServerClient.sendKeepAlive('Coffee.ecore'), 59000);
            }
        });
        commands.registerCommand(UnsubscribeKeepAliveCommand, {
            execute: () => {
                this.modelServerClient.unsubscribe('Coffee.ecore');
            }
        });
        commands.registerCommand(SubscribeWithTimeoutCommand, {
            execute: () => {
                this.initializeWebSocket();
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
                const setCommand: ModelServerCommand = ModelServerCommandUtil.createSetCommand(owner, feature, changedValues);
                this.modelServerClient
                    .edit('SuperBrewer3000.coffee', setCommand)
                    .then(response => this.messageService.info(printResponse(response)));
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
                const removeCommand: ModelServerCommand = ModelServerCommandUtil.createRemoveCommand(owner, feature, indices);
                this.modelServerClient
                    .edit('SuperBrewer3000.coffee', removeCommand)
                    .then(response => this.messageService.info(printResponse(response)));
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
                const addCommand: ModelServerCommand = ModelServerCommandUtil.createAddCommand(owner, feature, toAdd);
                this.modelServerClient
                    .edit('SuperBrewer3000.coffee', addCommand)
                    .then(response => this.messageService.info(printResponse(response)));
            }
        });
        commands.registerCommand(SaveCommand, {
            execute: () => {
                this.modelServerClient
                    .save('SuperBrewer3000.coffee')
                    .then(response => this.messageService.info(printResponse(response)));
            }
        });

        commands.registerCommand(GetTypeSchemaCommand, {
            execute: () => {
                this.modelServerClient
                    .getTypeSchema('Coffee.ecore')
                    .then(response => this.messageService.info(printResponse(response)));
            }
        });

        commands.registerCommand(GetUiSchemaCommand, {
            execute: () => {
                this.modelServerClient.getUiSchema('controlunit').then(response => this.messageService.info(printResponse(response)));
            }
        });

        commands.registerCommand(GetModelElementByIdCommand, {
            execute: () => {
                this.modelServerClient
                    .getElementById('SuperBrewer3000.coffee', '//@workflows.0')
                    .then(response => this.messageService.info(printResponse(response)));
            }
        });

        commands.registerCommand(GetModelElementByNameCommand, {
            execute: () => {
                this.modelServerClient
                    .getElementByName('SuperBrewer3000.coffee', 'BrewingFlow')
                    .then(response => this.messageService.info(printResponse(response)));
            }
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerSubmenu(API_TEST_MENU, 'ModelServer');

        menus.registerMenuAction(SERVER_SECTION, { commandId: PingCommand.id });

        menus.registerMenuAction(GET_SECTION, { commandId: GetModelUrisCommand.id, order: 'a' });
        menus.registerMenuAction(GET_SECTION, { commandId: GetAllCommand.id, order: 'b' });
        menus.registerMenuAction(GET_SECTION, { commandId: GetModelCommand.id, order: 'c' });
        menus.registerMenuAction(GET_SECTION, { commandId: GetModelElementByIdCommand.id, order: 'd' });
        menus.registerMenuAction(GET_SECTION, { commandId: GetModelElementByNameCommand.id, order: 'e' });

        menus.registerMenuAction(EDIT_SECTION, { commandId: EditSetCommand.id });
        menus.registerMenuAction(EDIT_SECTION, { commandId: EditRemoveCommand.id });
        menus.registerMenuAction(EDIT_SECTION, { commandId: EditAddCommand.id });
        menus.registerMenuAction(EDIT_SECTION, { commandId: PatchCommand.id });

        menus.registerMenuAction(SAVE_SECTION, { commandId: SaveCommand.id });

        menus.registerMenuAction(SCHEMA_SECTION, { commandId: GetTypeSchemaCommand.id });
        menus.registerMenuAction(SCHEMA_SECTION, { commandId: GetUiSchemaCommand.id });

        menus.registerMenuAction(WEBSOCKET_SECTION, { commandId: SubscribeCommand.id, order: 'a' });
        menus.registerMenuAction(WEBSOCKET_SECTION, { commandId: UnsubscribeCommand.id, order: 'b' });
        menus.registerMenuAction(WEBSOCKET_SECTION, { commandId: SubscribeAndKeepAliveCommand.id, order: 'c' });
        menus.registerMenuAction(WEBSOCKET_SECTION, { commandId: UnsubscribeKeepAliveCommand.id, order: 'd' });
        menus.registerMenuAction(WEBSOCKET_SECTION, { commandId: SubscribeWithTimeoutCommand.id, order: 'e' });
        menus.registerMenuAction(WEBSOCKET_SECTION, { commandId: KeepSubscriptionAliveCommand.id, order: 'f' });
        menus.registerMenuAction(WEBSOCKET_SECTION, { commandId: UnsubscribeTimeoutCommand.id, order: 'g' });
    }

    private initializeWebSocket(clearIntervalId = false): void {
        this.modelServerSubscriptionService.onOpenListener(() => this.messageService.info('Subscription opened!'));
        this.modelServerSubscriptionService.onDirtyStateListener((dirtyState: any) => this.messageService.info(`DirtyState ${dirtyState}`));
        this.modelServerSubscriptionService.onIncrementalUpdateListener((update: any) => this.messageService.info(`IncrementalUpdate ${JSON.stringify(update)}`));
        this.modelServerSubscriptionService.onFullUpdateListener((fullUpdate: any) => this.messageService.info(`FullUpdate ${JSON.stringify(fullUpdate)}`));
        this.modelServerSubscriptionService.onSuccessListener((successMessage: any) => this.messageService.info(`Success ${successMessage}`));
        this.modelServerSubscriptionService.onUnknownMessageListener((message: any) => this.messageService.warn(`Unknown Message ${JSON.stringify(message)}`));
        this.modelServerSubscriptionService.onClosedListener((reason: any) => {
            if (clearIntervalId) {
                clearInterval(this.intervalId);
            }
            this.messageService.info(`Subscription closed! Reason: ${reason}`);
        });
        this.modelServerSubscriptionService.onErrorListener((error: any) => {
            if (clearIntervalId) {
                clearInterval(this.intervalId);
            }
            this.messageService.error(`Error! ${JSON.stringify(error)}`);
        });
    }
}

function printResponse(response: Response<any>): string {
    return `StatusCode: ${response.statusCode}
            StatusMessage: ${response.statusMessage}
            Body: ${response.body ? JSON.stringify(response.body) : 'undefined'}`;
}
