# Model Server Typescript API

## Typescript Client API

The model server project features a Typescript-based client API that eases integration with the Model Server.
The interface declaration is as defined below. Please note that the `Model` class is a POJO with a model uri and content.

```typescript
export interface ModelServerClient extends JsonRpcServer<ModelServerFrontendClient> {
    initialize(): Promise<boolean>;

    get(modelUri: string, format?: string): Promise<Response<string>>;
    getAll(format?: string): Promise<Response<Model[]>>;
    getModelUris(): Promise<Response<string[]>>;

    getElementById(modelUri: string, elementid: string, format?: string): Promise<Response<string>>;
    getElementByName(modelUri: string, elementname: string, format?: string): Promise<Response<string>>;

    delete(modelUri: string): Promise<Response<boolean>>;
    update(modelUri: string, newModel: any): Promise<Response<string>>;

    configure(configuration?: ServerConfiguration): Promise<Response<boolean>>;
    ping(): Promise<Response<boolean>>;

    undo(modelUri: string): Promise<Response<string>>;
    redo(modelUri: string): Promise<Response<string>>;
    save(modelUri: string): Promise<Response<boolean>>;
    saveAll(): Promise<Response<boolean>>;

    getLaunchOptions(): Promise<LaunchOptions>;

    edit(modelUri: string, command: ModelServerCommand): Promise<Response<boolean>>;

    getTypeSchema(modelUri: string): Promise<Response<string>>;
    getUiSchema(schemaName: string): Promise<Response<string>>;

    validation(modelUri: string): Promise<Response<string>>;
    validationConstraints(modelUri: string): Promise<Response<string>>;

    // WebSocket connection
    subscribe(modelUri: string): void;
    subscribeWithValidation(modelUri: string): void;
    subscribeWithFormat(modelUri: string, format: string): void;
    subscribeWithTimeout(modelUri: string, timeout: number): void;
    subscribeWithTimeoutAndFormat(modelUri: string, timeout: number, format: string): void;
    sendKeepAlive(modelUri: string): void;
    unsubscribe(modelUri: string): void;
}
```

## Typescript API Examples

```typescript

@inject(ModelServerClient) protected readonly modelServerClient: ModelServerClient;

// perform simple GET
this.modelServerClient.get('SuperBrewer3000.json')
    .then((response: Response<any>) => this.messageService.info("GET: " + response.body()));

// perform same GET, but expect an EObject
this.modelServerClient.get('SuperBrewer3000.coffee', 'xmi')
    .then((response: Response<any>) => this.messageService.info("GET XMI: " + response.body()));

// perform GET ALL
this.modelServerClient.getAll()
    .then((response: Response<any>) => this.messageService.info("GET ALL: " + response.body()));

// perform GET ELEMENT
this.modelServerClient.getElementByName('SuperBrewer3000.json', 'Super Brewer 3000')
    .then((response: Response<any>) => this.messageService.info("GET ELEMENT: " + response.body()));
            
// perform ADD COMMAND (adds an AutomaticTask to the first Workflow and expects incremental update)
const owner = {
    'eClass':
        'http://www.eclipsesource.com/modelserver/example/coffeemodel#//Workflow',
    '$ref':
        `${this.workspaceUri}/SuperBrewer3000.json#//@workflows.0`
};
const feature = 'nodes';
const toAdd = [
    {
        eClass: 'http://www.eclipsesource.com/modelserver/example/coffeemodel#//AutomaticTask'
    }
];
const addCommand = new AddCommand(owner, feature, toAdd);
this.modelServerClient.edit('SuperBrewer3000.json', addCommand)
    .then((response: any) => this.messageService.info("INCREMENTAL UPDATE: " + response.body()));

// perform UNDO
this.modelServerClient.undo('SuperBrewer3000.json')
    .then((response: any) => this.messageService.info("INCREMENTAL UPDATE AFTER UNDO: " + response.body()));

// subscribe
this.modelServerClient.subscribe('SuperBrewer3000.json');

// unsubscribe
this.modelServerClient.unsubscribe('SuperBrewer3000.json');
            
```
