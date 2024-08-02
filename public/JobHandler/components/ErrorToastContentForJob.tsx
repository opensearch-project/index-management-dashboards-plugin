/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiSmallButton, EuiSpacer, EuiText } from "@elastic/eui";
import React from "react";
import { Modal } from "../../components/Modal";

export const ErrorToastContentForJob = (props: { shortError?: React.ReactChild; fullError?: React.ReactChild }) => {
  const { shortError = null, fullError } = props;
  return (
    <div>
      <div>{shortError}</div>
      {fullError ? (
        <>
          <EuiSpacer />
          <EuiSmallButton
            onClick={
              /* istanbul ignore next */ () => {
                Modal.show({
                  locale: {
                    ok: "Close",
                  },
                  title: shortError || "",
                  content: (
                    <EuiText>
                      <div>{fullError}</div>
                    </EuiText>
                  ),
                });
              }
            }
            style={{ float: "right" }}
            color="danger"
          >
            See full error
          </EuiSmallButton>
        </>
      ) : null}
    </div>
  );
};
