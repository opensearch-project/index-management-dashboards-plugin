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
  <>
    {[IndicesUpdateMode.alias, IndicesUpdateMode.settings, IndicesUpdateMode.mappings].map((item) => {
      if (!template[item]) {
        return null;
      }

      return (
        <EuiBadge
          style={{
            textTransform: "capitalize",
            visibility: template[item] ? undefined : "hidden",
            display: template[item] ? undefined : "none",
          }}
          key={item}
          color="hollow"
        >
          {item}
        </EuiBadge>
      );
    })}
  </>
);

export default ComponentTemplateBadge;
