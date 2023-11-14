/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
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
