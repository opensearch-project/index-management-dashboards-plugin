/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiButtonEmpty, EuiButtonProps, EuiButtonEmptyProps } from "@elastic/eui";
import classNames from "classnames";
import BottomBar from "../BottomBar";
import "./index.scss";

export interface CustomFormRowProps {
  unsavedCount: number;
  formErrorsCount?: number;
  onClickCancel?: () => void;
  onClickSubmit: () => Promise<void>;
  submitButtonDataTestSubj?: string;
  renderProps?: (props: {
    renderCancel: () => React.ReactChild;
    renderConfirm: () => React.ReactChild;
    renderUnsavedText: () => React.ReactChild;
    loading?: boolean;
  }) => React.ReactChild;
  confirmButtonProps?: EuiButtonProps;
  cancelButtonprops?: EuiButtonEmptyProps;
}

export default function UnsavedChangesBottomBar(props: CustomFormRowProps) {
  const { unsavedCount, onClickCancel, onClickSubmit, submitButtonDataTestSubj, formErrorsCount } = props;
  const [loading, setLoading] = useState(false);
  const destroyRef = useRef(false);
  const onClick = async () => {
    setLoading(true);
    try {
      await onClickSubmit();
      // eslint-disable-next-line no-empty
    } catch (e) {
    } finally {
      if (destroyRef.current) {
        // eslint-disable-next-line no-unsafe-finally
        return;
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      destroyRef.current = true;
    };
  }, []);

  const renderCancel = useCallback(
    () => (
      <EuiFlexItem grow={false}>
        <EuiButtonEmpty onClick={onClickCancel} color="ghost" iconType="cross" children="Cancel" {...props.cancelButtonprops} />
      </EuiFlexItem>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClickCancel]
  );

  const renderConfirm = useCallback(
    () => (
      <EuiFlexItem grow={false}>
        <EuiButton
          data-test-subj={submitButtonDataTestSubj}
          onClick={onClick}
          isLoading={loading}
          disabled={loading}
          iconType="check"
          color="primary"
          fill
          size="m"
          children="Save"
          {...props.confirmButtonProps}
        />
      </EuiFlexItem>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClick, submitButtonDataTestSubj, loading]
  );

  const renderUnsavedText = useCallback(
    () => (
      <>
        {formErrorsCount ? (
          <EuiFlexItem style={{ flexDirection: "row" }}>
            <div
              className={classNames({
                "ISM-unsaved-changes-blocks": true,
                danger: true,
              })}
            />
            {formErrorsCount} form errors.
          </EuiFlexItem>
        ) : null}
        {unsavedCount && !formErrorsCount ? (
          <EuiFlexItem style={{ flexDirection: "row" }}>
            <div
              className={classNames({
                "ISM-unsaved-changes-blocks": true,
                warning: true,
              })}
            />
            {unsavedCount} unsaved changes.
          </EuiFlexItem>
        ) : null}
      </>
    ),
    [unsavedCount, formErrorsCount]
  );

  const renderProps =
    props.renderProps ||
    (() => (
      <>
        {renderUnsavedText()}
        {renderCancel()}
        {renderConfirm()}
      </>
    ));

  return (
    <BottomBar>
      <EuiFlexGroup alignItems="center">
        {renderProps({
          renderCancel,
          renderConfirm,
          renderUnsavedText,
          loading,
        })}
      </EuiFlexGroup>
    </BottomBar>
  );
}
