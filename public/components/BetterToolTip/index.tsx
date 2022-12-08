import { EuiToolTip } from "@elastic/eui";

export default class BetterToolTip extends EuiToolTip {
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
