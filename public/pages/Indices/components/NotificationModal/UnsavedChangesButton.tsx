// FILE: UnsavedChangesButtons.tsx

import React, { useCallback, useRef, useState } from "react";
import { EuiSmallButton, EuiSmallButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import classNames from "classnames";

interface UnsavedChangesButtonsProps {
  unsavedCount: number;
  formErrorsCount?: number;
  onClickCancel?: () => void;
  onClickSubmit: () => Promise<void>;
  submitButtonDataTestSubj?: string;
}

const UnsavedChangesButtons: React.FC<UnsavedChangesButtonsProps> = ({
  unsavedCount,
  formErrorsCount,
  onClickCancel,
  onClickSubmit,
  submitButtonDataTestSubj,
}) => {
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

  const renderCancel = useCallback(
    () => (
      <EuiSmallButtonEmpty onClick={onClickCancel} iconType="cross" target="_blank">
        Cancel
      </EuiSmallButtonEmpty>
    ),
    [onClickCancel]
  );

  const renderConfirm = useCallback(
    () => (
      <EuiSmallButton
        data-test-subj={submitButtonDataTestSubj}
        onClick={onClick}
        isLoading={loading}
        disabled={loading}
        iconType="check"
        color="primary"
        fill
      >
        Save
      </EuiSmallButton>
    ),
    [onClick, submitButtonDataTestSubj, loading]
  );

  return (
    <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
      <>
        {formErrorsCount ? (
          <EuiFlexItem grow={false}>
            <EuiText color="danger" size="s">
              {" "}
              {formErrorsCount} form errors{" "}
            </EuiText>
          </EuiFlexItem>
        ) : null}
        {unsavedCount && !formErrorsCount ? (
          <EuiFlexItem grow={false}>
            <EuiText color="warning" size="s">
              {" "}
              {unsavedCount} unsaved changes{" "}
            </EuiText>
          </EuiFlexItem>
        ) : null}
      </>
      <EuiFlexItem grow={false}>{renderCancel()}</EuiFlexItem>
      <EuiFlexItem grow={false}>{renderConfirm()}</EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default UnsavedChangesButtons;
