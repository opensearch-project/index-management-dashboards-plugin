/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useContext } from "react";
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
import { useState } from "react";
import { useEffect } from "react";
import { ICatComposableTemplate } from "../../../ComposableTemplates/interface";
import { IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { useMemo } from "react";
import ComponentTemplateBadge from "../../../../components/ComponentTemplateBadge";

export default function ComposableTemplate(props: SubDetailProps) {
  const { field, readonly } = props;
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedComposableTemplates, setSelectedComposableTemplates] = useState<string[]>([]);
  const [allComposableTemplates, setAllComposableTemplates] = useState<ICatComposableTemplate[]>([]);
  const values: TemplateItem = field.getValues();
  const services = useContext(ServicesContext) as BrowserServices;
  useEffect(() => {
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
                <div>Component templates - optional</div>
              </EuiTitle>
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
                  <EuiFlexItem grow={false}>
                    <EuiText style={{ width: 20, marginLeft: 8 }}>{index + 1}</EuiText>
                  </EuiFlexItem>
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
          <EuiButton style={{ marginLeft: 20 }} onClick={() => window.open(`#${ROUTES.CREATE_COMPOSABLE_TEMPLATE}`)}>
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
    </ContentPanel>
  );
}
