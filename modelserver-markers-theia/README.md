# Markers management for Model Server validation Diagnostics

## Use case

The model server client API provides validation methods which manipulate JSON objects which can be cast as `Diagnostic` objects (`@eclipse-emfcloud/modelserver-theia/lib/browser/diagnostic`).

```typescript
export interface ModelServerClient extends JsonRpcServer<ModelServerFrontendClient> {
    validation(modelUri: string): Promise<Response<string>>;

    // WebSocket connection
    subscribeWithValidation(modelUri: string): void;
}
```

Users may want to log these validation diagnostics in Theia's Problems view (provided by `@theia/markers`).
This module provides the necessary tools to achieve this purpose with minimalist code.

## Typescript API Examples

After calling the validation, you can create markers as simply as :

```typescript

@inject(MessageService) protected readonly messageService: MessageService;
@inject(DiagnosticManager) protected readonly diagnosticManager: DiagnosticManager;

const modelURI : URI;
// perform validation
this.modelServerClient.validation(modelURI.toString())
    .then((response: Response<any>) => {
        // get resulting diagnostic
        const diagnostic = response.body as Diagnostic;
        // print markers in Problems view
        diagnosticManager.setDiagnostic(modelURI, diagnostic);
        // display the validation status
        this.messageService.info(`Validation finished with level ${Diagnostic.getSeverityLabel(diagnostic)}.`)
    });
            
```

## Selecting the model element from the marker

The marker in the problems view can be used to navigate to the precise element in error.
As this navigation depends on your model editor implementation, you must implement the `OpenHandler` interface if you want this functionality (see `@theia/core/lib/browser/opener-service.ts`).
In the opener options, you will find a `selection` entry, which value can be cast as a `ModelElementRange`, containing fake start and end values, but the correct model element's URI fragment (identifier) at the `uriFragment` key.
It is up to your widget implementation to select the correct element corresponding to this URI fragment.
