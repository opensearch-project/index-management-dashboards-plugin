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
import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { EuiGlobalToastList, EuiGlobalToastListProps } from "@elastic/eui";

export type SimpleEuiToastProps = EuiGlobalToastListProps["toasts"][number];

const TOAST_MOUNT_ID = "EUI_SIMPLE_TOAST_MOUNT_ID";

let addToastHandler: (params: SimpleEuiToastProps) => void;
let removeAllToastsHandler: () => void;
let id = 0;

const SimpleToast = () => {
  const [toasts, setToasts] = useState<SimpleEuiToastProps[]>([]);

  addToastHandler = (toast) => {
    setToasts(toasts.concat(toast));
  };

  const removeToast: (params: SimpleEuiToastProps & { id: string }) => void = (removedToast) => {
    setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
  };

  removeAllToastsHandler = () => {
    setToasts([]);
  };

  useEffect(() => {
    return () => {
      removeAllToastsHandler();
    };
  }, []);

  return <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={6000} />;
};

export const SimpleEuiToast = {
  show: (props: Partial<SimpleEuiToastProps> & { title: SimpleEuiToastProps["title"] }) => {
    let dom;
    if (!document.getElementById(TOAST_MOUNT_ID)) {
      dom = document.createElement("div");
      dom.id = TOAST_MOUNT_ID;
      dom.setAttribute("data-role", "SimpleEuiToast");
      document.body.appendChild(dom);
      render(<SimpleToast {...props} />, dom);
    } else {
      dom = document.getElementById(TOAST_MOUNT_ID);
    }
    addToastHandler({
      ...props,
      "data-test-subj": `toast_${props.title}`,
      id: `toast_${id++}`,
    });
  },
  addSuccess: (message: SimpleEuiToastProps["text"]) =>
    SimpleEuiToast.show({
      title: message,
      color: "success",
    }),
  addDanger: (message: SimpleEuiToastProps["text"]) =>
    SimpleEuiToast.show({
      title: message,
      color: "danger",
    }),
};
