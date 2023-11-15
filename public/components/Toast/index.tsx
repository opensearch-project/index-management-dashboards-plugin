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
