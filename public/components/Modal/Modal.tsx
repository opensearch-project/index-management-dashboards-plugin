/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiModal, EuiModalHeader, EuiModalHeaderTitle, EuiButton, EuiModalBody, EuiModalFooter, EuiModalProps } from "@elastic/eui";
import React, { Component, createContext, useEffect, useState } from "react";
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

interface IShowOptions extends Pick<EuiModalProps, "style" | "maxWidth" | "className"> {
  title?: React.ReactChild;
  content?: React.ReactChild;
  type?: "alert" | "confirm";
  visible?: boolean;
  "data-test-subj"?: string;
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

const SimpleModal = (props: IShowOptions) => {
  const [modalVisible, setModalVisible] = useState(props.visible === undefined ? true : props.visible);
  const { title, content, locale, onOk = blank, onCancel = blank, onClose = blank, ...others } = props;
  const testSubj = props["data-test-subj"] || title || Date.now();
  const defaultLocale: IShowOptions["locale"] = {
    ok: "OK",
    confirm: "Confirm",
    cancel: "Cancel",
  };
  const finalLocale: IShowOptions["locale"] = {
    ...defaultLocale,
    ...locale,
  };
  const close = () => {
    if (props.visible === undefined) {
      setModalVisible(false);
    }
    onClose();
  };
  useEffect(() => {
    if (props.visible !== undefined) {
      setModalVisible(props.visible);
    }
  }, [props.visible]);
  return modalVisible ? (
    <EuiModal {...others} onClose={close}>
      <EuiModalHeader>
        <EuiModalHeaderTitle style={{ width: "100%" }}>
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
              data-test-subj={`${testSubj}-confirm`}
              onClick={async () => {
                await onOk();
                close();
              }}
            >
              {finalLocale.confirm}
            </EuiButton>
            <EuiButton
              data-test-subj={`${testSubj}-cancel`}
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
              data-test-subj={`${testSubj}-ok`}
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

    render(<SimpleModal {...props} onClose={close} />, dom);
  },
  SimpleModal,
};

export { ModalConsumer, ModalProvider, Modal };
