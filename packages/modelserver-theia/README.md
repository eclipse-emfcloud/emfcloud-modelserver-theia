# Model Server Typescript API

## Typescript Client API

The model server project features a Typescript-based client API that eases integration with the Model Server.
The interface declaration is as defined below. Please note that the `Model` class is a POJO with a model uri and content.

```typescript
export interface ModelServerClient extends JsonRpcServer<ModelServerFrontendClient> {
  initialize(): Promise<boolean>;

  get(modeluri: URI, format?: string): Promise<Response<string>>;
  getAll(format?: string): Promise<Response<Model[]>>;
  getModelUris(): Promise<Response<URI[]>>;

  getElementById(modeluri: URI, elementid: string, format?: string): Promise<Response<string>>;
  getElementByName(modeluri: URI, elementname: string, format?: string): Promise<Response<string>>;

  delete(modeluri: URI): Promise<Response<boolean>>;
  update(modeluri: URI, newModel: any): Promise<Response<string>>;

  configure(configuration?: ServerConfiguration): Promise<Response<boolean>>;
  ping(): Promise<Response<boolean>>;

  undo(modeluri: URI): Promise<Response<string>>;
  redo(modeluri: URI): Promise<Response<string>>;
  save(modeluri: URI): Promise<Response<boolean>>;
  saveAll(): Promise<Response<boolean>>;

  getLaunchOptions(): Promise<LaunchOptions>;

  edit(modeluri: URI, command: ModelServerCommand): Promise<Response<boolean>>;

  getTypeSchema(modeluri: URI): Promise<Response<string>>;
  getUiSchema(schemaName: string): Promise<Response<string>>;

  validation(modeluri: URI): Promise<Response<string>>;
  validationConstraints(modeluri: URI): Promise<Response<string>>;

  // WebSocket connection
  subscribe(modeluri: URI): void;
  subscribeWithValidation(modeluri: URI): void;
  subscribeWithFormat(modeluri: URI, format: string): void;
  subscribeWithTimeout(modeluri: URI, timeout: number): void;
  subscribeWithTimeoutAndFormat(modeluri: URI, timeout: number, format: string): void;
  sendKeepAlive(modeluri: URI): void;
  unsubscribe(modeluri: URI): void;
}
```

## Typescript API Examples

```typescript

@inject(TheiaModelServerClient) protected readonly modelServerClient: TheiaModelServerClient;

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
