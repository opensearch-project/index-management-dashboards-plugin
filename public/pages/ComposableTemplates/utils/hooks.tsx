/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { CoreStart } from "opensearch-dashboards/public";
import { CommonService, ServicesContext } from "../../../services";
import { TemplateItemRemote } from "../../../../models/interfaces";
import { getAllUsedComponents } from "./services";
import { useState, useCallback, useContext, useEffect, useRef } from "react";
import { BrowserServices } from "../../../models/interfaces";

export const getTemplate = async (props: {
  templateName: string;
  commonService: CommonService;
  coreService: CoreStart;
}): Promise<TemplateItemRemote> => {
  const response = await props.commonService.apiCaller<{
    index_templates: { name: string; index_template: TemplateItemRemote }[];
  }>({
    endpoint: "transport.request",
    data: {
      method: "GET",
      path: `_index_template/${props.templateName}?flat_settings=true`,
    },
  });
  let error: string = "";
  if (response.ok) {
    const findItem = response.response?.index_templates?.find((item) => item.name === props.templateName);
    if (findItem) {
      const templateDetail = findItem.index_template;
      return JSON.parse(JSON.stringify(templateDetail));
    }
    error = `The template [${props.templateName}] does not exist.`;
  } else {
    error = response.error || "";
  }

  props.coreService.notifications.toasts.addDanger(error);
  throw new Error(error);
};

export const getComponentMapTemplate = async ({ commonService }: { commonService: CommonService }) => {
  const allIndicesTemplates = await getAllUsedComponents({
    commonService,
  });

  const componentMapTemplate: Record<string, string[]> = {};

  allIndicesTemplates.forEach((item) => {
    item.index_template.composed_of?.forEach((composedItem) => {
      componentMapTemplate[composedItem] = componentMapTemplate[composedItem] || [];
      componentMapTemplate[composedItem].push(item.name);
    });
  });

  return componentMapTemplate;
};

const cache: {
  usedRequest: Promise<Record<string, string[]>> | undefined;
} = {
  usedRequest: undefined,
};

let listenerNumber = 0;

const CACHE_REFRESH_EVENT = "CACHE_REFRESH_EVENT";

export const getComponentMapTemplateWithCache = (
  props: Parameters<typeof getComponentMapTemplate>[0] & {
    force?: boolean;
  }
) => {
  if (props.force || !cache.usedRequest) {
    cache.usedRequest = getComponentMapTemplate({
      commonService: props.commonService,
    });
  }
  return cache.usedRequest;
};

export const submitTemplateChange = async (props: {
  templateName: string;
  commonService: CommonService;
  coreService: CoreStart;
  transformTemplate: (templateItem: TemplateItemRemote) => TemplateItemRemote;
}) => {
  const { templateName, commonService, coreService, transformTemplate = (templateItem) => templateItem } = props;
  const currentTemplate = await getTemplate({
    templateName,
    commonService,
    coreService,
  });
  const updateResult = await commonService.apiCaller({
    endpoint: "transport.request",
    data: {
      method: "POST",
      path: `_index_template/${templateName}`,
      body: transformTemplate(currentTemplate),
    },
  });
  return updateResult;
};

export const useComponentMapTemplate = () => {
  const [componentMapTemplate, setComponentMapTemplate] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const services = useContext(ServicesContext) as BrowserServices;
  const destroyRef = useRef<boolean>(false);

  const reload = useCallback((force?: boolean) => {
    setLoading(true);
    getComponentMapTemplateWithCache({
      force,
      commonService: services.commonService,
    }).then((res) => {
      if (force) {
        window.dispatchEvent(new CustomEvent(CACHE_REFRESH_EVENT));
      }
      if (destroyRef.current) {
        return;
      }
      setComponentMapTemplate(res);
      setLoading(false);
    });
  }, []);

  const eventHandler = useCallback(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    reload();
    window.addEventListener(CACHE_REFRESH_EVENT, eventHandler);
    listenerNumber++;
    return () => {
      window.removeEventListener(CACHE_REFRESH_EVENT, eventHandler);
      listenerNumber--;
      if (listenerNumber === 0) {
        /**
         * when all the listeners are gone
         * we should clear the usedRequest
         * so that the componentTemplates page
         * will re-fetch the index templates data
         */
        cache.usedRequest = undefined;
      }
    };
  }, [eventHandler]);

  useEffect(() => {
    return () => {
      destroyRef.current = true;
    };
  }, []);

  return {
    reload,
    loading,
    componentMapTemplate,
  };
};
