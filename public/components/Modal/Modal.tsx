/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiModal, EuiModalHeader, EuiModalHeaderTitle, EuiButton, EuiModalBody, EuiModalFooter } from "@elastic/eui";
import React, { Component, createContext, useState } from "react";
import { render } from "react-dom";

const ModalContext = createContext({
  component: null,
  props: {},
  onShow: (component: any, props: object) => {},
  onClose: () => {},
});

const ModalConsumer = ModalContext.Consumer;

class ModalProvider extends Component {
  state = { component: null, props: {} };

  onShow = (component: any, props: object): void => {
    this.setState({
      component,
      props,
    });
  };

  onClose = (): void => {
    this.setState({
      component: null,
      props: {},
    });
  };

  render() {
    return (
      <ModalContext.Provider value={{ ...this.state, onShow: this.onShow, onClose: this.onClose }}>
        {this.props.children}
      </ModalContext.Provider>
    );
  }
}

interface IShowOptions {
  title?: React.ReactChild;
  content?: React.ReactChild;
  type?: "alert" | "confirm";
  onOk?: () => void | Promise<any>;
  onCancel?: () => void | Promise<any>;
  onClose?: () => void;
  locale?: Partial<{
    ok: string;
    confirm: string;
    cancel: string;
  }>;
}

const blank = () => null;

const ModalApp = (props: IShowOptions) => {
  const { title, content, locale, onOk = blank, onCancel = blank, onClose = blank } = props;
  const defaultLocale: IShowOptions["locale"] = {
    ok: "OK",
    confirm: "Confirm",
    cancel: "Cancel",
  };
  const finalLocale: IShowOptions["locale"] = {
    ...defaultLocale,
    ...locale,
  };
  const [modalVisible, setModalVisible] = useState(true);
  const close = () => {
    setModalVisible(false);
    onClose();
  };
  return modalVisible ? (
    <EuiModal onClose={close}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>{title}</h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>{content}</EuiModalBody>
      <EuiModalFooter>
        {props.type === "confirm" ? (
          <>
            <EuiButton
              fill
              color="primary"
              onClick={async () => {
                await onOk();
                close();
              }}
            >
              {finalLocale.confirm}
            </EuiButton>
            <EuiButton
              fill
              color="secondary"
              onClick={async () => {
                await onCancel();
                close();
              }}
            >
              {finalLocale.cancel}
            </EuiButton>
          </>
        ) : (
          <>
            <EuiButton
              fill
              color="primary"
              onClick={async () => {
                await onOk();
                close();
              }}
            >
              {finalLocale.ok}
            </EuiButton>
          </>
        )}
      </EuiModalFooter>
    </EuiModal>
  ) : null;
};

const Modal = {
  show: (props: IShowOptions) => {
    const dom = document.createElement("div");
    document.body.appendChild(dom);
    const close = () => {
      dom.remove();
    };

    render(<ModalApp {...props} onClose={close} />, dom);
  },
};

export { ModalConsumer, ModalProvider, Modal };
