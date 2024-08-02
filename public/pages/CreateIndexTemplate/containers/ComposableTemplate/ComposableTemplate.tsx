/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useContext, useRef, useState, useEffect, useMemo } from "react";
import {
  EuiSmallButton,
  EuiSmallButtonIcon,
  EuiDragDropContext,
  EuiDraggable,
  EuiDroppable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHighlight,
  EuiIcon,
  EuiLink,
  EuiPanel,
  EuiSelectable,
  EuiSpacer,
  EuiText,
  EuiTitle,
  euiDragDropReorder,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { SubDetailProps } from "../../interface";
import { TemplateItem } from "../../../../../models/interfaces";
import { Modal } from "../../../../components/Modal";
import { ICatComposableTemplate } from "../../../ComposableTemplates/interface";
import { IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import ComponentTemplateBadge from "../../../../components/ComponentTemplateBadge";
import ComponentTemplateDetail, { IComponentTemplateDetailInstance } from "../../../CreateComposableTemplate/containers/TemplateDetail";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import FilterGroup from "../../../../components/FilterGroup";

export default function ComposableTemplate(props: SubDetailProps) {
  const { field, readonly, history } = props;
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedComposableTemplates, setSelectedComposableTemplates] = useState<string[]>([]);
  const [allComposableTemplates, setAllComposableTemplates] = useState<ICatComposableTemplate[]>([]);
  const [createComponentVisible, setCreateComponentVisible] = useState(false);
  const values: TemplateItem = field.getValues();
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const componentCreateRef = useRef<IComponentTemplateDetailInstance>(null);
  const reloadAllComposableTemplates = () =>
    services.commonService
      .apiCaller<{
        component_templates?: ICatComposableTemplate[];
      }>({
        endpoint: "transport.request",
        data: {
          method: "GET",
          path: `/_component_template/*`,
        },
        hideLog: true,
      })
      .then((res) => {
        if (res && res.ok) {
          setAllComposableTemplates(res.response.component_templates || []);
        }
      });
  useEffect(() => {
    reloadAllComposableTemplates();
  }, []);
  const finalOptions = useMemo(
    () =>
      allComposableTemplates.filter((item) => {
        if (!selectedTypes.length) {
          return true;
        }

        return selectedTypes.every((type) => !!item.component_template.template[type as IndicesUpdateMode]);
      }),
    [selectedTypes, allComposableTemplates]
  );

  if (readonly) {
    return null;
  }

  return (
    <ContentPanel
      title={
        <>
          <CustomFormRow
            fullWidth
            label={
              <EuiTitle size="s">
                <div>Component template</div>
              </EuiTitle>
            }
            helpText={
              <>
                Define an index template by combining component templates containing index configurations. Associate existing component
                templates or create one. You can arrange the priority of the component templates by dragging them. The component template
                placed on bottom has the highest priority.{" "}
                <EuiLink target="_blank" external href={coreServices.docLinks.links.opensearch.indexTemplates.composable}>
                  Learn more
                </EuiLink>
              </>
            }
          >
            <></>
          </CustomFormRow>
        </>
      }
      titleSize="s"
    >
      {values.composed_of && values.composed_of.length && allComposableTemplates.length ? (
        <EuiDragDropContext
          onDragEnd={({ source, destination }) => {
            if (source && destination) {
              const items = euiDragDropReorder(values.composed_of || [], source.index, destination.index);
              field.setValue("composed_of", items);
            }
          }}
        >
          <EuiDroppable droppableId="composableTemplatesDropArea" spacing="none">
            {values.composed_of.map((item, index) => {
              const findItem = allComposableTemplates.find((template) => template.name === item);
              if (!findItem) {
                return <div key={item} />;
              }

              return (
                <EuiFlexGroup key={item} alignItems="center">
                  <EuiFlexItem>
                    <EuiDraggable
                      isDragDisabled={readonly}
                      index={index}
                      customDragHandle
                      draggableId={item}
                      key={item}
                      style={{ paddingLeft: 0, paddingRight: 0 }}
                      spacing="m"
                    >
                      {(provided) => (
                        <EuiPanel paddingSize="m">
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <div {...provided.dragHandleProps} aria-label="Drag Handle">
                                <EuiIcon type="grab" />
                              </div>
                              <span style={{ marginLeft: 12 }}>{findItem.name}</span>
                              <div style={{ marginLeft: 12 }}>
                                <ComponentTemplateBadge template={findItem.component_template.template} />
                              </div>
                            </div>
                            <div>
                              {readonly ? null : (
                                <EuiSmallButtonIcon
                                  onClick={() => {
                                    const newValue = [...(values.composed_of || [])];
                                    newValue.splice(index, 1);
                                    field.setValue("composed_of", newValue);
                                  }}
                                  iconType="trash"
                                  color="danger"
                                  aria-label="delete"
                                />
                              )}
                              <EuiSmallButtonIcon
                                onClick={() => window.open(`#${ROUTES.CREATE_COMPOSABLE_TEMPLATE}/${item}`)}
                                style={{ marginLeft: 12 }}
                                iconType="inspect"
                                color="primary"
                                aria-label="see detail"
                              />
                            </div>
                          </div>
                        </EuiPanel>
                      )}
                    </EuiDraggable>
                  </EuiFlexItem>
                </EuiFlexGroup>
              );
            })}
          </EuiDroppable>
        </EuiDragDropContext>
      ) : (
        <EuiText>No component templates associated</EuiText>
      )}
      <EuiSpacer />
      {readonly ? null : (
        <div>
          <EuiSmallButton onClick={() => setDialogVisible(true)}>Associate component templates</EuiSmallButton>
          <EuiSmallButton style={{ marginLeft: 20 }} onClick={() => setCreateComponentVisible(true)}>
            Create component template
          </EuiSmallButton>
        </div>
      )}
      <Modal.SimpleModal
        type="confirm"
        visible={dialogVisible}
        locale={{
          confirm: `Associate (${selectedComposableTemplates.length})`,
        }}
        footer={["cancel", "confirm"]}
        style={{
          width: 860,
        }}
        title="Associate component templates"
        onOk={() => {
          field.setValue("composed_of", [...(field.getValue("composed_of") || []), ...selectedComposableTemplates]);
          setSelectedComposableTemplates([]);
        }}
        onClose={() => setDialogVisible(false)}
        content={
          <EuiSelectable
            searchable
            options={finalOptions.map((item) => ({
              value: item,
              label: item.name,
              checked: [...(values.composed_of || []), ...selectedComposableTemplates].includes(item.name) ? "on" : undefined,
              disabled: (values.composed_of || []).includes(item.name),
            }))}
            onChange={(val) => {
              setSelectedComposableTemplates(val.filter((item) => item.checked === "on" && !item.disabled).map((item) => item.label));
            }}
            searchProps={{
              placeholder: "Search",
            }}
            listProps={{
              rowHeight: 40,
              bordered: true,
            }}
            renderOption={(option, searchValue) => (
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiHighlight search={searchValue}>{option.label}</EuiHighlight>
                </EuiFlexItem>
                <EuiFlexItem grow={false} style={{ flexDirection: "row" }}>
                  <ComponentTemplateBadge template={option.value.component_template.template} />
                </EuiFlexItem>
              </EuiFlexGroup>
            )}
            height={480}
          >
            {(list, search) => (
              <>
                <EuiFlexGroup>
                  <EuiFlexItem>{search}</EuiFlexItem>
                  <EuiFlexItem style={{ flexBasis: "100px" }} grow={false}>
                    <FilterGroup
                      filterButtonProps={{
                        children: "Types",
                      }}
                      onChange={(val) => setSelectedTypes(val || [])}
                      value={selectedTypes}
                      options={[
                        {
                          label: IndicesUpdateMode.alias,
                        },
                        {
                          label: IndicesUpdateMode.mappings,
                        },
                        {
                          label: IndicesUpdateMode.settings,
                        },
                      ]}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
                {list}
              </>
            )}
          </EuiSelectable>
        }
      />
      {createComponentVisible ? (
        <Modal.SimpleModal
          maxWidth={false}
          style={{
            width: "70vw",
          }}
          type="confirm"
          title="Create component template"
          visible={createComponentVisible}
          onCancel={() => setCreateComponentVisible(false)}
          locale={{
            confirm: "Create",
          }}
          footer={["cancel", "confirm"]}
          onOk={() => {
            componentCreateRef.current?.submit();
            // return a reject promise to keep it from closing
            return Promise.reject("no error");
          }}
          onClose={() => setCreateComponentVisible(false)}
          content={
            <ComponentTemplateDetail
              hideTitle
              hideButton
              noPanel
              onSubmitSuccess={(name) => {
                reloadAllComposableTemplates();
                field.setValue("composed_of", [...(field.getValue("composed_of") || []), name]);
                setCreateComponentVisible(false);
              }}
              ref={componentCreateRef}
              history={history}
            />
          }
        />
      ) : null}
    </ContentPanel>
  );
}
