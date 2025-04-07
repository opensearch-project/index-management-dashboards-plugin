/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { monaco } from "@osd/monaco";

// Ensure JSON language is registered
if (!monaco.languages.getLanguages().some((lang) => lang.id === "json")) {
  monaco.languages.register({
    id: "json",
    extensions: [".json", ".bowerrc", ".jshintrc", ".jscsrc", ".eslintrc", ".babelrc"],
    aliases: ["JSON", "json"],
    mimetypes: ["application/json"],
  });
}

// Initialize JSON language features if not already available
if (!monaco.languages.json) {
  // Create a namespace for JSON language features
  (monaco.languages as any).json = {};
}

// Define the diagnostics options type to be used throughout the file
type JsonDiagnosticsOptions = {
  validate: boolean;
  allowComments: boolean;
  schemas: any[];
  enableSchemaRequest: boolean;
  [key: string]: any;
};

// Create jsonDefaults if it doesn't exist
if (!monaco.languages.json.jsonDefaults) {
  const jsonDefaults = {
    _diagnosticsOptions: {
      validate: true,
      allowComments: true,
      schemas: [],
      enableSchemaRequest: false,
    } as JsonDiagnosticsOptions,
    _onDidChange: new monaco.Emitter<JsonDiagnosticsOptions>(),

    get diagnosticsOptions(): JsonDiagnosticsOptions {
      return this._diagnosticsOptions;
    },

    setDiagnosticsOptions(options: JsonDiagnosticsOptions) {
      this._diagnosticsOptions = { ...this._diagnosticsOptions, ...options };
      this._onDidChange.fire(this._diagnosticsOptions);
    },

    get onDidChange() {
      return this._onDidChange.event;
    },
  };

  // Attach jsonDefaults to monaco.languages.json
  (monaco.languages.json as any).jsonDefaults = jsonDefaults;
}

// Export a compatible interface for backward compatibility
export class LanguageServiceDefaultsImpl {
  _onDidChange: monaco.Emitter<any>;
  _languageId: string;
  _diagnosticsOptions: JsonDiagnosticsOptions;

  constructor(languageId: string, diagnosticsOptions: JsonDiagnosticsOptions) {
    this._onDidChange = new monaco.Emitter();
    this._languageId = languageId;
    this._diagnosticsOptions = diagnosticsOptions || Object.create(null);
    this.setDiagnosticsOptions(diagnosticsOptions);
  }

  public get languageId() {
    return this._languageId;
  }

  public get onDidChange() {
    return this._onDidChange.event;
  }

  public get diagnosticsOptions() {
    return this._diagnosticsOptions;
  }

  setDiagnosticsOptions(options: JsonDiagnosticsOptions) {
    this._diagnosticsOptions = options || Object.create(null);
    this._onDidChange.fire(this);

    // Update monaco.languages.json.jsonDefaults with our options
    if (monaco.languages.json && monaco.languages.json.jsonDefaults) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions(options);
    }
  }
}

// Register JSON completion provider if needed
if (monaco.languages.json && !(monaco.languages.json as any)._jsonCompletionProviderRegistered) {
  monaco.languages.registerCompletionItemProvider("json", {
    provideCompletionItems: (model, position, context, token) => {
      // Basic JSON completion provider
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const match = textUntilPosition.match(/"([^"]*)":\s*$/);
      if (match) {
        // After property name, suggest values
        return {
          suggestions: [
            {
              label: "true",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "true",
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            },
            {
              label: "false",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "false",
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            },
            {
              label: "null",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "null",
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            },
            {
              label: "{}",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "{}",
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            },
            {
              label: "[]",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "[]",
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            },
          ],
        };
      }

      return { suggestions: [] };
    },
  });

  // Mark as registered to avoid duplicate registration
  (monaco.languages.json as any)._jsonCompletionProviderRegistered = true;
}
