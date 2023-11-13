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
import React, { forwardRef } from "react";
import ToolTipWithoutWarning from "../ToolTipWithoutWarning";

interface IEuiToolTipWrapperOptions {
  disabledKey?: string;
}

export interface IEuiToolTipWrapperProps {
  disabledReason?:
    | string
    | Array<{
        visible: boolean;
        message: string;
      }>;
}

export default function EuiToolTipWrapper<T>(
  Component: React.ComponentType<T>,
  options?: IEuiToolTipWrapperOptions
): React.ComponentType<T & IEuiToolTipWrapperProps> {
  return forwardRef(({ disabledReason, children, ...others }, ref) => {
    const finalOptions: Required<IEuiToolTipWrapperOptions> = {
      ...{
        disabledKey: "disabled",
      },
      ...options,
    };
    let formattedReason: IEuiToolTipWrapperProps["disabledReason"];
    if (typeof disabledReason === "string") {
      formattedReason = [
        {
          visible: true,
          message: disabledReason,
        },
      ];
    } else {
      formattedReason = disabledReason;
    }
    formattedReason = formattedReason?.filter((item) => item.visible && item.message);
    const propsDisabled = (others as Record<string, any>)[finalOptions.disabledKey];
    const disabled = propsDisabled === undefined ? !!formattedReason?.length : propsDisabled;
    const finalProps: IEuiToolTipWrapperProps = {
      ...others,
      [finalOptions.disabledKey]: disabled,
    };
    return (
      <ToolTipWithoutWarning
        content={
          disabled && formattedReason?.length ? (
            <>
              This field is disabled because:
              <ol>
                {formattedReason?.map((item, index) => (
                  <li style={{ display: "flex" }} key={item.message}>
                    <span
                      style={{
                        width: "1.5em",
                        textAlign: "right",
                      }}
                    >
                      {index + 1}.
                    </span>
                    <span>{item.message}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : undefined
        }
        display="block"
        position="right"
      >
        <>
          <Component {...(finalProps as T)} ref={ref} />
        </>
      </ToolTipWithoutWarning>
    );
  }) as React.ComponentType<T & IEuiToolTipWrapperProps>;
}
