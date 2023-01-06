import React, { useEffect, useRef, useState } from "react";
import { EuiButton, EuiBottomBar, EuiFlexGroup, EuiFlexItem, EuiButtonEmpty } from "@elastic/eui";

export type CustomFormRowProps = {
  unsavedCount: number;
  onClickCancel: () => Promise<void>;
  onClickSubmit: () => Promise<void>;
  submitButtonDataTestSubj?: string;
};

export default function CustomFormRow(props: CustomFormRowProps) {
  const { unsavedCount, onClickCancel, onClickSubmit, submitButtonDataTestSubj } = props;
  const [loading, setLoading] = useState(false);
  const bottomBarRef = useRef(null);
  const onClick = async () => {
    setLoading(true);
    try {
      await onClickSubmit();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bodyDom = document.querySelector<HTMLDivElement>("#opensearch-dashboards-body");
    let originalBodyPaddingBottom = "";
    if (bodyDom) {
      originalBodyPaddingBottom = bodyDom.style.paddingBottom;
      bodyDom.style.paddingBottom = "64px";
    }

    return () => {
      if (bodyDom) {
        bodyDom.style.paddingBottom = originalBodyPaddingBottom;
      }
    };
  }, []);

  return (
    <EuiBottomBar ref={bottomBarRef}>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>{unsavedCount} unsaved changes.</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty onClick={onClickCancel} color="ghost" iconType="cross" size="s">
            Cancel changes
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            data-test-subj={submitButtonDataTestSubj}
            onClick={onClick}
            isLoading={loading}
            disabled={loading}
            iconType="check"
            color="secondary"
            fill
            size="s"
          >
            Save changes
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiBottomBar>
  );
}
