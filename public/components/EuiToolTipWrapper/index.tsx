import React, { forwardRef } from "react";
import { EuiToolTip } from "@elastic/eui";

interface IEuiToolTipWrapperOptions {
  disabledKey?: string;
}

export interface IEuiToolTipWrapperProps {
  disabledReason?:
    | string
    | {
        visible: boolean;
        message: string;
      }[];
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
      <EuiToolTip
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
      </EuiToolTip>
    );
  }) as React.ComponentType<T & IEuiToolTipWrapperProps>;
}
