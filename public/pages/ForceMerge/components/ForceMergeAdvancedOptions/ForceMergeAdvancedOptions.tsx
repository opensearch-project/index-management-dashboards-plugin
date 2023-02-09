/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import CustomFormRow from "../../../../components/CustomFormRow";
import { EuiCheckbox, EuiComboBox, EuiComboBoxOptionOption, EuiFieldNumber, EuiLink, EuiRadioGroup, EuiSpacer } from "@elastic/eui";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";

interface ReindexOptionsProps {}

const ReindexAdvancedOptions = (props: ReindexOptionsProps) => {
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  const {} = props;

  return (
    <div style={{ padding: "10px 10px" }}>
      <CustomFormRow
        label="Reindex only unique documents"
        helpText={
          <>
            You can choose to copy only the documents that do not exist in the destination index. By default, OpenSearch will copy all
            documents from the source index.{" "}
            <EuiLink href={coreServices.docLinks.links.opensearch.reindexData.unique} target="_blank">
              Learn more.
            </EuiLink>
          </>
        }
      >
        123
      </CustomFormRow>
    </div>
  );
};

export default ReindexAdvancedOptions;
