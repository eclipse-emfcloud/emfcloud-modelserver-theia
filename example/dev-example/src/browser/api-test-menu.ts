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
import { ModelServerSubscriptionService } from "@modelserver/theia/lib/browser";
import { ModelServerClient, ModelServerCommand, ModelServerCommandUtil, Response } from "@modelserver/theia/lib/common";
import {
  Command,
  CommandContribution,
  CommandRegistry,
  MAIN_MENU_BAR,
  MenuContribution,
  MenuModelRegistry,
  MessageService
} from "@theia/core";
import { WorkspaceService } from "@theia/workspace/lib/browser";
import { inject, injectable } from "inversify";

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

export const API_TEST_MENU = [...MAIN_MENU_BAR, '9_API_TEST_MENU'];
export const PING = [...API_TEST_MENU, PingCommand.label];
export const GET_MODEL = [...API_TEST_MENU, GetModelCommand.label];
export const GET_ALL = [...API_TEST_MENU, GetAllCommand.label];
export const PATCH = [...API_TEST_MENU, PatchCommand.label];
export const SUBSCRIBE = [...API_TEST_MENU, SubscribeCommand.label];
export const UNSUBSCRIBE = [...API_TEST_MENU, UnsubscribeCommand.label];
export const EDIT_SET = [...API_TEST_MENU, EditSetCommand.label];
export const EDIT_REMOVE = [...API_TEST_MENU, EditRemoveCommand.label];
export const EDIT_ADD = [...API_TEST_MENU, EditAddCommand.label];
export const SAVE = [...API_TEST_MENU, SaveCommand.label];

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
export class ApiTestMenuContribution
  implements MenuContribution, CommandContribution {
  @inject(MessageService) protected readonly messageService: MessageService;
  @inject(ModelServerClient)
  protected readonly modelServerClient: ModelServerClient;
  @inject(ModelServerSubscriptionService)
  protected readonly modelServerSubscriptionService: ModelServerSubscriptionService;
  private workspaceUri: string;


  constructor(@inject(WorkspaceService) protected readonly workspaceService: WorkspaceService) {
    workspaceService.onWorkspaceChanged(e => {
      if (e[0] && e[0].uri) {
        this.workspaceUri = e[0].uri.replace("file://", "file:");
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
    commands.registerCommand(PatchCommand, {
      execute: () => {
        this.modelServerClient
          .update('SuperBrewer3000.coffee', exampleFilePatch)
          .then(response => this.messageService.info(printResponse(response)));
      }
    });
    commands.registerCommand(SubscribeCommand, {
      execute: () => {
        this.modelServerSubscriptionService.onOpenListener(() =>
          this.messageService.info('Subscription opened!')
        );
        this.modelServerSubscriptionService.onDirtyStateListener(dirtyState => this.messageService.info(`DirtyState ${dirtyState}`));
        this.modelServerSubscriptionService.onIncrementalUpdateListener(incrementalUpdate => this.messageService.info(`IncrementalUpdate ${JSON.stringify(incrementalUpdate)}`));
        this.modelServerSubscriptionService.onFullUpdateListener(fullUpdate => this.messageService.info(`FullUpdate ${JSON.stringify(fullUpdate)}`));
        this.modelServerSubscriptionService.onSuccessListener(successMessage => this.messageService.info(`Success ${successMessage}`));
        this.modelServerSubscriptionService.onUnknownMessageListener(message => this.messageService.warn(`Unknown Message ${JSON.stringify(message)}`));

        this.modelServerSubscriptionService.onClosedListener(reason =>
          this.messageService.info(`Closed!
        Reason: ${reason}`)
        );
        this.modelServerSubscriptionService.onErrorListener(error =>
          this.messageService.error(JSON.stringify(error))
        );
        this.modelServerClient.subscribe('SuperBrewer3000.coffee');
      }
    });
    commands.registerCommand(UnsubscribeCommand, {
      execute: () => {
        this.modelServerClient.unsubscribe('SuperBrewer3000.coffee');
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
        this.modelServerClient.edit('SuperBrewer3000.coffee', setCommand);
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
        this.modelServerClient.edit('SuperBrewer3000.coffee', removeCommand);
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
        this.modelServerClient.edit('SuperBrewer3000.coffee', addCommand);
      }
    });
    commands.registerCommand(SaveCommand, {
      execute: () => {
        this.modelServerClient.save('SuperBrewer3000.coffee');
      }
    });
  }
  registerMenus(menus: MenuModelRegistry): void {
    menus.registerSubmenu(API_TEST_MENU, 'ModelServer');
    menus.registerMenuAction(API_TEST_MENU, { commandId: PingCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: GetModelCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: GetAllCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: PatchCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: SubscribeCommand.id });
    menus.registerMenuAction(API_TEST_MENU, {
      commandId: UnsubscribeCommand.id
    });
    menus.registerMenuAction(API_TEST_MENU, { commandId: EditSetCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: EditRemoveCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: EditAddCommand.id });
    menus.registerMenuAction(API_TEST_MENU, { commandId: SaveCommand.id });
  }
}

function printResponse(response: Response<any>) {
  return `StatusCode: ${response.statusCode}
            StatusMessage: ${response.statusMessage}
            Body: ${
    response.body ? JSON.stringify(response.body) : 'undefined'
    }`;
}
