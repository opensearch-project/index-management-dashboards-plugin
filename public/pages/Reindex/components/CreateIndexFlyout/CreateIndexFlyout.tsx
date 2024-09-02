/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import CreateIndex, { IndexFormProps, IndexForm } from "../../../CreateIndex/containers/IndexForm";
import { CoreServicesContext } from "../../../../components/core_services";
import { EuiFlyout, EuiFlyoutBody, EuiFlyoutFooter, EuiFlyoutHeader, EuiText, EuiTitle } from "@elastic/eui";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";

interface CreateIndexFlyoutProps extends IndexFormProps {
  sourceIndices: string[];
  onCloseFlyout: () => void;
}

export default class CreateIndexFlyout extends React.Component<CreateIndexFlyoutProps> {
  static contextType = CoreServicesContext;

  createIndexRef: IndexForm | null = null;

  render() {
    const { onCloseFlyout } = this.props;
    return (
      <EuiFlyout onClose={() => {}} hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiText size="s">
            <h2 id="flyoutTitle"> Create Index </h2>
          </EuiText>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <CreateIndex ref={(ref) => (this.createIndexRef = ref)} hideButtons={true} {...this.props} />
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter
            action=""
            text="Create"
            edit={false}
            onClickCancel={onCloseFlyout}
            onClickAction={() => this.createIndexRef?.onSubmit()}
          />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
