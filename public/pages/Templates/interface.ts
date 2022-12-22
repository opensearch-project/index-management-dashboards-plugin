import { TemplateItemRemote } from "../../../models/interfaces";

export interface ITemplate {
  name: string;
  index_patterns: string;
  order: number;
  version?: string;
  composed_of: string;
  templateDetail?: TemplateItemRemote;
}
