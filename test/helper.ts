import { navigationPluginMock } from "../../../src/plugins/navigation/public/mocks";
import { applicationServiceMock } from "../../../src/core/public/application/application_service.mock";
import { uiSettingsServiceMock } from "../../../src/core/public/ui_settings/ui_settings_service.mock";
import { setApplication, setNavigationUI, setUISettings } from "../public/services/Services";

export function setupCoreStart() {
  setNavigationUI(navigationPluginMock.createStartContract().ui);
  setApplication(applicationServiceMock.createStartContract());
  setUISettings(uiSettingsServiceMock.createStartContract());
}
