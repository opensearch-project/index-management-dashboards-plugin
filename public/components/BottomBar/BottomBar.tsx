/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef } from "react";
import { EuiBottomBar } from "@elastic/eui";

export type CustomFormRowProps = {
  children?: React.ReactChild;
};

export default function BottomBar(props: CustomFormRowProps) {
  const bottomBarRef = useRef(null);
  const destroyRef = useRef(false);

  useEffect(() => {
    const bodyDom = document.querySelector<HTMLDivElement>("#opensearch-dashboards-body");
    let originalBodyPaddingBottom = "";
    if (bodyDom) {
      originalBodyPaddingBottom = bodyDom.style.paddingBottom;
      bodyDom.style.paddingBottom = "64px";
    }

    return () => {
      destroyRef.current = true;
      if (bodyDom) {
        bodyDom.style.paddingBottom = originalBodyPaddingBottom;
      }
    };
  }, []);

  return <EuiBottomBar ref={bottomBarRef}>{props.children}</EuiBottomBar>;
}
