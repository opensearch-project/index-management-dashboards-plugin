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

import React from "react";
import { EuiFlyout, EuiFlyoutBody, EuiFlyoutFooter, EuiFlyoutHeader, EuiTitle } from "@elastic/eui";
import CreateIndex, { IndexFormProps, IndexForm } from "../../../CreateIndex/containers/IndexForm";
import { CoreServicesContext } from "../../../../components/core_services";
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
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Create Index </h2>
          </EuiTitle>
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
