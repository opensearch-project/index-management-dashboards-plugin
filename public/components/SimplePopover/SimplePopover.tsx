/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, cloneElement, useCallback } from "react";
import { EuiPopover, EuiPopoverProps } from "@elastic/eui";
import { useEffect } from "react";

interface SimplePopoverProps extends Partial<EuiPopoverProps> {
  triggerType?: "click" | "hover";
  button: React.ReactElement;
}

const SimplePopover: React.SFC<SimplePopoverProps> = (props) => {
  const { triggerType = "click", ...others } = props;
  const [popVisible, setPopVisible] = useState(false);
  const buttonProps: Partial<React.HTMLAttributes<HTMLButtonElement>> = {};
  if (triggerType === "click") {
    buttonProps.onClick = (e) => {
      e.stopPropagation();
      setPopVisible(!popVisible);
    };
  }

  if (triggerType === "hover") {
    buttonProps.onMouseEnter = () => {
      setPopVisible(true);
    };
    buttonProps.onMouseLeave = () => {
      setPopVisible(false);
    };
  }

  const outsideClick = useCallback(() => {
    if (!popVisible) {
      return;
    }
    setTimeout(() => {
      setPopVisible(false);
    }, 0);
  }, [popVisible, setPopVisible]);

  useEffect(() => {
    window.addEventListener("click", outsideClick);
    return () => {
      window.removeEventListener("click", outsideClick);
    };
  }, [outsideClick]);

  return (
    <EuiPopover {...others} button={props.button && cloneElement(props.button, buttonProps)} isOpen={popVisible} closePopover={() => {}} />
  );
};

export default SimplePopover;
