/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSmallButton,
  EuiModalBody,
  EuiModalFooter,
  EuiModalProps,
  EuiModalBodyProps,
  EuiButtonProps,
  EuiButtonEmpty,
} from "@elastic/eui";
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

type footerEnum = "confirm" | "cancel";

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
  footer?: footerEnum[];
  bodyProps?: EuiModalBodyProps;
  confirmButtonProps?: EuiButtonProps;
  CancelButtonComponent?: typeof EuiSmallButton | typeof EuiButtonEmpty;
}

const blank = () => null;

const SimpleModal = (props: IShowOptions) => {
  const [modalVisible, setModalVisible] = useState(props.visible === undefined ? true : props.visible);
  const {
    title,
    content,
    locale,
    onOk = blank,
    onCancel = blank,
    onClose = blank,
    visible,
    footer = ["confirm", "cancel"],
    confirmButtonProps,
    CancelButtonComponent = EuiButtonEmpty,
    ...others
  } = props;
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
    if (visible !== undefined) {
      setModalVisible(visible);
    }
  }, [visible]);
  return modalVisible ? (
    <EuiModal {...others} onClose={close}>
      <EuiModalHeader>
        <EuiModalHeaderTitle style={{ width: "100%" }}>
          <h1>{title}</h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody {...props.bodyProps}>{content}</EuiModalBody>
      <EuiModalFooter>
        {props.type === "confirm" ? (
          <>
            {footer.map((item) => {
              if (item === "confirm") {
                return (
                  <EuiSmallButton
                    key={item}
                    fill
                    color="primary"
                    data-test-subj={`${testSubj}-confirm`}
                    onClick={async () => {
                      try {
                        await onOk();
                        close();
                      } catch (e) {
                        // do nothing
                      }
                    }}
                    {...confirmButtonProps}
                  >
                    {finalLocale.confirm}
                  </EuiSmallButton>
                );
              } else if (item === "cancel") {
                return (
                  <CancelButtonComponent
                    key={item}
                    data-test-subj={`${testSubj}-cancel`}
                    onClick={async () => {
                      await onCancel();
                      close();
                    }}
                  >
                    {finalLocale.cancel}
                  </CancelButtonComponent>
                );
              }
            })}
          </>
        ) : (
          <>
            <EuiSmallButton
              fill
              color="primary"
              data-test-subj={`${testSubj}-ok`}
              onClick={async () => {
                try {
                  await onOk();
                  close();
                } catch (e) {
                  // do nothing
                }
              }}
            >
              {finalLocale.ok}
            </EuiSmallButton>
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
