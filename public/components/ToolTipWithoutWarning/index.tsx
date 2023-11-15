/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiToolTip } from "@elastic/eui";

/**
 * The EuiToolTip has an issue when calling showToolTip / clearAnimationTimeout.
 * It does not check if the component is still mounted.
 * And it will give a warning in browser console and terminal when running unittest.
 */
export default class ToolTipWithoutWarning extends EuiToolTip {
  protected newTimeoutId?: ReturnType<typeof setTimeout>;
  showToolTip = () => {
    if (!this.newTimeoutId) {
      this.newTimeoutId = setTimeout(() => {
        if (this._isMounted) {
          this.setState({ visible: true });
        }
      }, 0);
    }
  };
  clearAnimationTimeout = () => {
    if (this.newTimeoutId) {
      this.newTimeoutId = clearTimeout(this.newTimeoutId) as undefined;
    }
  };
}
