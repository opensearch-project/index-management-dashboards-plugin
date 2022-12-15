import { EuiComboBox, EuiComboBoxProps } from "@elastic/eui";

export default class BetterComboBox<T> extends EuiComboBox<T> {
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
