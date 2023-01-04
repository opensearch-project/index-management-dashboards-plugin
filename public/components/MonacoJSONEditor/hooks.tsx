import { monaco } from "@osd/monaco";
import { euiThemeVars } from "@osd/ui-shared-deps/theme";
import { useEffect, useRef } from "react";
import { DiagnosticsOptions } from "./interface";

monaco.editor.defineTheme("ismJSONTheme", {
  base: "vs",
  inherit: true,
  rules: [],
  colors: {
    "editorWarning.foreground": euiThemeVars.euiColorWarningText,
  },
});

export function useDiagnosticsOptions(props: { monaco?: typeof monaco; diagnosticsOptions?: DiagnosticsOptions }) {
  const oldOptionsSettingsRef = useRef<DiagnosticsOptions | undefined>(props.monaco?.languages.json.jsonDefaults.diagnosticsOptions);
  useEffect(() => {
    if (props.monaco) {
      props.monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        ...oldOptionsSettingsRef.current,
        ...props.diagnosticsOptions,
        schemas: [...(oldOptionsSettingsRef.current?.schemas || []), ...(props.diagnosticsOptions?.schemas || [])],
      });
    }
    return () => {
      props.monaco?.languages.json.jsonDefaults.setDiagnosticsOptions(oldOptionsSettingsRef.current || {});
    };
  }, [props.monaco, props.diagnosticsOptions]);
}

export function useModel(props: { editor?: monaco.editor.IStandaloneCodeEditor; path?: string }) {
  useEffect(() => {
    if (props.path && props.editor) {
      const originalModel = props.editor.getModel() as monaco.editor.ITextModel;
      const originalValue = originalModel.getValue();
      const originalLanguage = originalModel.getModeId();
      const originalUri = originalModel.uri;
      originalModel.dispose();
      const newModel = monaco.editor.createModel(
        originalValue,
        originalLanguage,
        monaco.Uri.from({
          scheme: originalUri.scheme,
          path: props.path,
        })
      );
      props.editor.setModel(newModel);
    }
  }, [props.path, props.editor]);

  useEffect(() => {
    return () => {
      props.editor?.getModel()?.dispose();
    };
  }, []);
}
