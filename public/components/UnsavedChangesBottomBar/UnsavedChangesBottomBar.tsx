/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiButtonEmpty, EuiButtonProps, EuiButtonEmptyProps } from "@elastic/eui";
import BottomBar from "../BottomBar";

export type CustomFormRowProps = {
  unsavedCount: number;
  onClickCancel: () => Promise<void>;
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
};

export default function UnsavedChangesBottomBar(props: CustomFormRowProps) {
  const { unsavedCount, onClickCancel, onClickSubmit, submitButtonDataTestSubj } = props;
  const [loading, setLoading] = useState(false);
  const destroyRef = useRef(false);
  const onClick = async () => {
    setLoading(true);
    try {
      await onClickSubmit();
    } catch (e) {
    } finally {
      if (destroyRef.current) {
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
        <EuiButtonEmpty onClick={onClickCancel} color="ghost" iconType="cross" children="Cancel changes" {...props.cancelButtonprops} />
      </EuiFlexItem>
    ),
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
          children="Save changes"
          {...props.confirmButtonProps}
        />
      </EuiFlexItem>
    ),
    [onClick, submitButtonDataTestSubj, loading]
  );

  const renderUnsavedText = useCallback(() => <EuiFlexItem>{unsavedCount} unsaved changes.</EuiFlexItem>, [unsavedCount]);

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
