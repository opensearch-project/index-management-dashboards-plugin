/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiSmallButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ModalConsumer } from "../Modal";

interface ContentPanelActionsProps {
  actions: {
    text: string;
    buttonProps?: object;
    flexItemProps?: object;
    children?: React.ReactChild;
    modal?: {
      onClickModal: (onShow: (component: any, props: object) => void) => () => void;
    };
  }[];
}

const ContentPanelActions: React.SFC<ContentPanelActionsProps> = ({ actions }) => (
  <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
    {actions.map(({ text, buttonProps = {}, flexItemProps = {}, modal = null, children }, index) => {
      let button = children ? (
        children
      ) : (
        <EuiSmallButton {...buttonProps} data-test-subj={`${text}Button`}>
          {text}
        </EuiSmallButton>
      );

      if (modal) {
        button = (
          <ModalConsumer>
            {({ onShow }) => (
              <EuiSmallButton {...buttonProps} onClick={modal.onClickModal(onShow)} data-test-subj={`${text}Button`}>
                {text}
              </EuiSmallButton>
            )}
          </ModalConsumer>
        );
      }

      return (
        <EuiFlexItem {...flexItemProps} grow={false} key={index}>
          {button}
        </EuiFlexItem>
      );
    })}
  </EuiFlexGroup>
);

export default ContentPanelActions;
