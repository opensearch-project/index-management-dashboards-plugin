/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiCompressedComboBox, EuiComboBoxProps } from "@elastic/eui";

/**
 * The EuiComboBox has an issue when calling closeList.
 * It does not check if the component is still mounted.
 * And it will give a warning in browser console and terminal when running unittest.
 */
export default class ComboBoxWithoutWarning<T> extends EuiCompressedComboBox<T> {
  memoriedCloseList: (event?: Event) => void;
  constructor(props: EuiComboBoxProps<T>) {
    super(props as any);
    this.memoriedCloseList = this.closeList;

    this.closeList = (event) => {
      if (this._isMounted) {
        this.memoriedCloseList.call(this, event);
      }
    };
  }
}
