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

import React, { useState, cloneElement, useCallback, useRef } from "react";
import { EuiPopover, EuiPopoverProps } from "@elastic/eui";
import { useEffect } from "react";
import { throttle } from "lodash";

interface SimplePopoverProps extends Partial<EuiPopoverProps> {
  triggerType?: "click" | "hover";
  button: React.ReactElement;
}

export const loopToGetPath = (element: HTMLElement | ParentNode | null) => {
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
  const destroyRef = useRef<boolean>(false);
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

  const outsideClick = useCallback(
    () => {
      setTimeout(() => {
        if (destroyRef.current) {
          return;
        }
        setPopVisible(false);
      }, 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [popVisible, setPopVisible]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(
    () => {
      if (popVisible && triggerType === "click") {
        window.addEventListener("click", outsideClick);
      }
      return () => {
        window.removeEventListener("click", outsideClick);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outsideClick, triggerType]
  );

  useEffect(() => {
    if (popVisible && triggerType === "hover") {
      window.addEventListener("mousemove", outsideHover);
    }
    return () => {
      window.removeEventListener("mousemove", outsideHover);
    };
  }, [popVisible, outsideHover, triggerType]);

  useEffect(() => {
    return () => {
      destroyRef.current = true;
    };
  }, []);

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
