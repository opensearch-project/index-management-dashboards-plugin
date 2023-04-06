/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useContext, useRef, useState, useEffect, useMemo } from "react";
import {
  EuiButton,
  EuiButtonIcon,
  EuiComboBox,
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
          path: `_component_template/*`,
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
                <div>Composable template</div>
              </EuiTitle>
            }
            helpText={
              <>
                Reduce the amount of index templates by associating index template components that cover common configurations. Associated
                components will appear below. You can arrange the priority of the components by dragging them. The component placed on top
                has the highest priority.{" "}
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
                return <></>;
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
                                <EuiButtonIcon
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
                              <EuiButtonIcon
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
        <EuiText>No components associate</EuiText>
      )}
      <EuiSpacer />
      {readonly ? null : (
        <div>
          <EuiButton onClick={() => setDialogVisible(true)}>Associate components</EuiButton>
          <EuiButton style={{ marginLeft: 20 }} onClick={() => setCreateComponentVisible(true)}>
            Create new components
          </EuiButton>
        </div>
      )}
      <Modal.SimpleModal
        type="confirm"
        visible={dialogVisible}
        locale={{
          confirm: `Associate(${selectedComposableTemplates.length})`,
        }}
        footer={["cancel", "confirm"]}
        style={{
          width: 860,
        }}
        title="Add components"
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
              placeholder: "Search components",
            }}
            listProps={{
              rowHeight: 40,
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
            height={240}
          >
            {(list, search) => (
              <>
                <EuiFlexGroup>
                  <EuiFlexItem>{search}</EuiFlexItem>
                  <EuiFlexItem style={{ flexBasis: "240px" }} grow={false}>
                    <EuiComboBox
                      placeholder="Types"
                      onChange={(val) => setSelectedTypes(val.map((item) => item.label))}
                      selectedOptions={selectedTypes.map((item) => ({ label: item }))}
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
          title="Create component"
          visible={createComponentVisible}
          onCancel={() => setCreateComponentVisible(false)}
          locale={{
            confirm: "Create component",
          }}
          footer={["cancel", "confirm"]}
          onOk={() => {
            componentCreateRef.current?.submit();
            // return a reject promise to keep it from closing
            return Promise.reject("no error");
          }}
          content={
            <ComponentTemplateDetail
              hideTitle
              hideButton
              noPanel
              onSubmitSuccess={(name) => {
                reloadAllComposableTemplates();
                field.setValue("composed_of", [...field.getValue("composed_of"), name]);
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