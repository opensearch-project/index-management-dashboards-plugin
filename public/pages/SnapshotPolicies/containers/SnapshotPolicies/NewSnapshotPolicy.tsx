import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

export default function NewSnapshotPolicy() {
  const { HeaderControl } = getNavigationUI();
  const { setAppRightControls } = getApplication();
  const uiSettings = getUISettings();
  const showActionsInHeader = uiSettings.get("home:useNewHomePage");
  console.log("showActionsinHeaderFlag Value is -> " + showActionsInHeader);

  return;
}
