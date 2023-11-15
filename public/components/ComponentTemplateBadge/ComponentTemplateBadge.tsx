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
