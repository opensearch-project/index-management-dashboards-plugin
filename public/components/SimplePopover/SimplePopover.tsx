/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, cloneElement, useCallback, useRef } from "react";
import { EuiPopover, EuiPopoverProps } from "@elastic/eui";
import { useEffect } from "react";
import { throttle } from "lodash";

interface SimplePopoverProps extends Partial<EuiPopoverProps> {
  triggerType?: "click" | "hover";
  button: React.ReactElement;
}

const loopToGetPath = (element: HTMLElement | ParentNode | null) => {
  if (!element) {
    return [];
  }
  const path = [element];
  while ((element = element.parentNode)) {
    path.push(element);
  }
  return path;
};

const SimplePopover: React.FC<SimplePopoverProps> = (props) => {
  const { triggerType = "click", ...others } = props;
  const [popVisible, setPopVisible] = useState(false);
  const popoverRef = useRef(null);
  const panelRef = useRef<HTMLElement | null>(null);
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
  }

  const outsideClick = useCallback(() => {
    if (!popVisible) {
      return;
    }
    setTimeout(() => {
      setPopVisible(false);
    }, 0);
  }, [popVisible, setPopVisible]);

  const outsideHover = useCallback(
    throttle((e: MouseEvent) => {
      if (popVisible && popoverRef.current && panelRef.current) {
        const path = loopToGetPath(e.target as HTMLElement);
        if (!(path.includes(popoverRef.current) || path.includes(panelRef.current))) {
          setPopVisible(false);
        }
      }
    }, 100),
    [popVisible, setPopVisible]
  );

  useEffect(() => {
    if (triggerType === "click") {
      window.addEventListener("click", outsideClick);
    }
    return () => {
      window.removeEventListener("click", outsideClick);
    };
  }, [outsideClick, triggerType]);

  useEffect(() => {
    if (popVisible && triggerType === "hover") {
      window.addEventListener("mousemove", outsideHover);
    }
    return () => {
      window.removeEventListener("mousemove", outsideHover);
    };
  }, [popVisible, outsideHover, triggerType]);

  return (
    <EuiPopover
      {...others}
      popoverRef={popoverRef}
      panelRef={(ref) => (panelRef.current = ref)}
      button={props.button && cloneElement(props.button, buttonProps)}
      isOpen={popVisible}
      closePopover={() => {}}
    />
  );
};

export default SimplePopover;
