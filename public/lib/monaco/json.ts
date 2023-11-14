/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { monaco } from "@osd/monaco";
// @ts-ignore
import * as mode from "monaco-editor/esm/vs/language/json/jsonMode.js"; // eslint-disable-line

const Emitter = monaco.Emitter;
class LanguageServiceDefaultsImpl {
  _onDidChange: monaco.Emitter<any>;
  _languageId: string;
  _diagnosticsOptions!: monaco.languages.json.DiagnosticsOptions;
  constructor(languageId: string, diagnosticsOptions: monaco.languages.json.DiagnosticsOptions) {
    this._onDidChange = new Emitter();
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
  }
}
export { LanguageServiceDefaultsImpl };
const diagnosticDefault = {
  validate: true,
  allowComments: true,
  schemas: [],
  enableSchemaRequest: false,
};
/**
 * In case there are other plugins register the language implementation.
 */
if (!monaco.languages.json) {
  const jsonDefaults = new LanguageServiceDefaultsImpl("json", diagnosticDefault);
  function createAPI() {
    return {
      jsonDefaults,
    };
  }
  monaco.languages.json = createAPI();
  monaco.languages.register({
    id: "json",
    extensions: [".json", ".bowerrc", ".jshintrc", ".jscsrc", ".eslintrc", ".babelrc"],
    aliases: ["JSON", "json"],
    mimetypes: ["application/json"],
  });
  monaco.languages.onLanguage("json", function () {
    mode.setupMode(jsonDefaults);
  });
}
