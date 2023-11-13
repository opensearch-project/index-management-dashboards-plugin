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
import React, { useEffect, useRef } from "react";
import { EuiBottomBar } from "@elastic/eui";

export interface CustomFormRowProps {
  children?: React.ReactChild;
}

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
