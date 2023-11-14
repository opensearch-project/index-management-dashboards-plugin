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
import { EuiComboBox, EuiComboBoxProps } from "@elastic/eui";

/**
 * The EuiComboBox has an issue when calling closeList.
 * It does not check if the component is still mounted.
 * And it will give a warning in browser console and terminal when running unittest.
 */
export default class ComboBoxWithoutWarning<T> extends EuiComboBox<T> {
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
