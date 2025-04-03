import { monaco } from "@osd/monaco";

// Use the existing Monaco JSON language features
// This ensures we're using the version that's already configured in OpenSearch Dashboards

// Make sure JSON language is registered
if (!monaco.languages.getLanguages().some((lang) => lang.id === "json")) {
  monaco.languages.register({
    id: "json",
    extensions: [".json", ".bowerrc", ".jshintrc", ".jscsrc", ".eslintrc", ".babelrc"],
    aliases: ["JSON", "json"],
    mimetypes: ["application/json"],
  });
}

// Set default diagnostics options if json language is available
if (monaco.languages.json) {
  const diagnosticDefault = {
    validate: true,
    allowComments: true,
    schemas: [],
    enableSchemaRequest: false,
  };

  // Only set diagnostics options if the method exists
  if (monaco.languages.json.jsonDefaults && typeof monaco.languages.json.jsonDefaults.setDiagnosticsOptions === "function") {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions(diagnosticDefault);
  }
}

// Export a compatible interface for backward compatibility
export class LanguageServiceDefaultsImpl {
  _onDidChange: monaco.Emitter<any>;
  _languageId: string;
  _diagnosticsOptions!: monaco.languages.json.DiagnosticsOptions;

  constructor(languageId: string, diagnosticsOptions: monaco.languages.json.DiagnosticsOptions) {
    this._onDidChange = new monaco.Emitter();
    this._languageId = languageId;
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

  setDiagnosticsOptions(options: monaco.languages.json.DiagnosticsOptions) {
    this._diagnosticsOptions = options || Object.create(null);
    this._onDidChange.fire(this);

    // If monaco.languages.json exists, also update its diagnostics options
    if (
      monaco.languages.json &&
      monaco.languages.json.jsonDefaults &&
      typeof monaco.languages.json.jsonDefaults.setDiagnosticsOptions === "function"
    ) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions(options);
    }
  }
}
