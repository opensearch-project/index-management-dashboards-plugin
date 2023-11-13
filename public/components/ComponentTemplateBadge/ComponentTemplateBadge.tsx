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

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBadge } from "@elastic/eui";
import React from "react";
import { IndicesUpdateMode } from "../../utils/constants";
import { IComposableTemplateRemote } from "../../../models/interfaces";

interface CustomLabelProps {
  template: IComposableTemplateRemote["template"];
}

const ComponentTemplateBadge = ({ template }: CustomLabelProps) => (
  <div style={{ lineHeight: 2 }}>
    {[IndicesUpdateMode.alias, IndicesUpdateMode.settings, IndicesUpdateMode.mappings]
      .filter((item) => template[item])
      .map((item) => {
        return (
          <EuiBadge
            style={{
              textTransform: "capitalize",
            }}
            key={item}
            color="hollow"
          >
            {item}
          </EuiBadge>
        );
      })}
  </div>
);

export default ComponentTemplateBadge;
