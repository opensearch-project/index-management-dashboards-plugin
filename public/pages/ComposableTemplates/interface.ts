import { IComposableTemplateRemote } from "../../../models/interfaces";

export interface ICatComposableTemplate {
  name: string;
  component_template: IComposableTemplateRemote;
  usedBy: string[];
  associatedCount: number;
}
