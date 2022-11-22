import React from "react";
import { EuiComboBox, EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader } from "@elastic/eui";
import FormGenerator from "../../../../components/FormGenerator";

export interface ICreateAliasProps {
  onSuccess: () => {};
}

function StringSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return <EuiComboBox></EuiComboBox>;
}

export default function CreateAlias(props: ICreateAliasProps) {
  return (
    <EuiFlyout onClose={() => {}}>
      <EuiFlyoutHeader>Create alias</EuiFlyoutHeader>
      <EuiFlyoutBody>
        <FormGenerator
          formFields={[
            {
              name: "alias",
              type: "Input",
              rowProps: {
                label: "Alias name",
              },
              options: {
                props: {
                  placeholder: "Specify alias name",
                },
              },
            },
            {
              name: "index",
              component,
            },
          ]}
        />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
