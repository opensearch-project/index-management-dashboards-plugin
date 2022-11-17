/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import CreateIndex, { IndexFormProps } from "../../../CreateIndex/containers/IndexForm";
import { CoreServicesContext } from "../../../../components/core_services";
import { EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader, EuiTitle } from "@elastic/eui";

interface CreateIndexFlyoutProps extends IndexFormProps {
  sourceIndices: string[];
}

export default class CreateIndexFlyout extends React.Component<CreateIndexFlyoutProps> {
  static contextType = CoreServicesContext;

  render() {
    return (
      <EuiFlyout onClose={() => {}} hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Create Index </h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <CreateIndex {...this.props}></CreateIndex>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
