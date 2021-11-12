/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ModalConsumer } from "../Modal";

interface ContentPanelActionsProps {
  actions: {
    text: string;
    buttonProps?: object;
    flexItemProps?: object;
    modal?: {
      onClickModal: (onShow: (component: any, props: object) => void) => () => void;
    };
  }[];
}

const ContentPanelActions: React.SFC<ContentPanelActionsProps> = ({ actions }) => (
  <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
    {actions.map(({ text, buttonProps = {}, flexItemProps = {}, modal = null }, index) => {
      let button = (
        <EuiButton {...buttonProps} data-test-subj={`${text}Button`}>
          {text}
        </EuiButton>
      );

      if (modal) {
        button = (
          <ModalConsumer>
            {({ onShow }) => (
              <EuiButton {...buttonProps} onClick={modal.onClickModal(onShow)} data-test-subj={`${text}Button`}>
                {text}
              </EuiButton>
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
