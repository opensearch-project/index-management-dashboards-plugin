/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component, Fragment } from "react";
import {
  EuiSpacer,
  EuiBasicTable,
  EuiSmallButton,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiSmallButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  // @ts-ignore
  Pagination,
  // @ts-ignore
  Criteria,
  EuiTableSelectionType,
  EuiTableFieldDataColumnType,
  EuiCompressedFormRow,
  EuiSelect,
  EuiText,
  EuiLink,
  EuiIcon,
  EuiPanel,
  EuiTitle,
  EuiFormHelpText,
  EuiHorizontalRule,
  EuiCallOut,
  EuiCompressedFieldNumber,
  EuiTableSortingType,
} from "@elastic/eui";
import { AddFieldsColumns } from "../../utils/constants";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../../Rollups/utils/constants";
import { isNumericMapping } from "../../utils/helpers";
import { DimensionItem, FieldItem } from "../../../../../models/interfaces";

interface AdvancedAggregationProps {
  fieldsOption: FieldItem[];
  onDimensionSelectionChange: (selectedFields: DimensionItem[]) => void;
  selectedDimensionField: DimensionItem[];
}

interface AdvancedAggregationState {
  isModalVisible: boolean;
  selectedFields: FieldItem[];
  allSelectedFields: FieldItem[];
  fieldsShown: FieldItem[];
  dimensionsShown: DimensionItem[];
  dimensionFrom: number;
  dimensionSize: number;
  dimensionSortField: string;
  dimensionSortDirection: string;
}

export default class AdvancedAggregation extends Component<AdvancedAggregationProps, AdvancedAggregationState> {
  constructor(props: AdvancedAggregationProps) {
    super(props);
    const { selectedDimensionField, fieldsOption } = this.props;
    this.state = {
      isModalVisible: false,
      allSelectedFields: [],
      fieldsShown: fieldsOption.slice(0, 10),
      dimensionsShown: selectedDimensionField.slice(0, 10),
      selectedFields: [],
      dimensionFrom: 0,
      dimensionSize: 10,
      dimensionSortField: "sequence",
      dimensionSortDirection: "desc",
    };
  }

  closeModal = () => this.setState({ isModalVisible: false });

  showModal = () => this.setState({ isModalVisible: true });

  onSelectionChange = (selectedFields: FieldItem[]): void => {
    this.setState({ selectedFields });
  };

  onClickAdd() {
    const { onDimensionSelectionChange, selectedDimensionField } = this.props;
    const { selectedFields, allSelectedFields, dimensionFrom, dimensionSize } = this.state;
    //Clone selectedDimensionField
    let updatedDimensions = Array.from(selectedDimensionField);
    const toAddFields = Array.from(selectedFields);

    selectedDimensionField.map((dimension) => {
      if (allSelectedFields.includes(dimension.field)) {
        const index = toAddFields.indexOf(dimension.field);
        toAddFields.splice(index, 1);
      }
    });
    //Update sequence number
    this.updateSequence(updatedDimensions);
    //Parse selectedFields to an array of DimensionItem if any of the field does not exist
    let i = updatedDimensions.length + 1;
    const toAdd: DimensionItem[] = toAddFields.map((field) => {
      return isNumericMapping(field.type)
        ? {
            sequence: i++,
            field: field,
            aggregationMethod: "histogram",
            interval: 5,
          }
        : {
            sequence: i++,
            field: field,
            aggregationMethod: "terms",
          };
    });
    const result = updatedDimensions.length ? updatedDimensions.concat(toAdd) : toAdd;
    onDimensionSelectionChange(result);
    this.setState({ allSelectedFields: allSelectedFields.concat(toAddFields) });
    this.setState({ dimensionsShown: result.slice(dimensionFrom, dimensionFrom + dimensionSize) });
    this.forceUpdate();
  }

  //Check the dimension num
  updateSequence(items: DimensionItem[]) {
    if (items.length == 0) {
      this.setState({ dimensionsShown: [] });
      return;
    }
    const { onDimensionSelectionChange } = this.props;
    const { dimensionSize: dimensionSize, dimensionFrom } = this.state;
    let dimensionNum;
    for (dimensionNum = 0; dimensionNum < items.length; dimensionNum++) {
      items[dimensionNum].sequence = dimensionNum + 1;
    }
    onDimensionSelectionChange(items);
    this.setState({ dimensionsShown: items.slice(dimensionFrom, dimensionFrom + dimensionSize) });
    this.forceUpdate();
  }

  moveUp(item: DimensionItem) {
    const { selectedDimensionField } = this.props;
    const toMoveindex = selectedDimensionField.indexOf(item);
    if (toMoveindex == 0) return;
    let toSwap = selectedDimensionField[toMoveindex - 1];
    selectedDimensionField[toMoveindex] = toSwap;
    selectedDimensionField[toMoveindex - 1] = item;
    this.updateSequence(selectedDimensionField);
  }

  moveDown(item: DimensionItem) {
    const { selectedDimensionField } = this.props;
    const toMoveindex = selectedDimensionField.indexOf(item);
    if (toMoveindex == selectedDimensionField.length - 1) return;
    let toSwap = selectedDimensionField[toMoveindex + 1];
    selectedDimensionField[toMoveindex] = toSwap;
    selectedDimensionField[toMoveindex + 1] = item;
    this.updateSequence(selectedDimensionField);
  }

  deleteField = (item: DimensionItem) => {
    const { selectedDimensionField } = this.props;
    const { selectedFields, allSelectedFields } = this.state;

    //Remove the dimension item and then update sequence.
    selectedDimensionField.splice(selectedDimensionField.indexOf(item), 1);
    selectedFields.splice(selectedFields.indexOf(item.field), 1);
    allSelectedFields.splice(allSelectedFields.indexOf(item.field), 1);
    this.setState({ selectedFields, allSelectedFields });
    this.updateSequence(selectedDimensionField);
  };

  onChangeInterval = (e: ChangeEvent<HTMLInputElement>, item: DimensionItem): void => {
    const { selectedDimensionField, onDimensionSelectionChange } = this.props;
    const index = selectedDimensionField.indexOf(item);
    const newItem: DimensionItem = {
      sequence: item.sequence,
      field: item.field,
      aggregationMethod: "histogram",
      interval: e.target.valueAsNumber,
    };
    selectedDimensionField[index] = newItem;
    this.updateSequence(selectedDimensionField);
    onDimensionSelectionChange(selectedDimensionField);
  };

  onChangeAggregationMethod = (e: ChangeEvent<HTMLSelectElement>, item: DimensionItem): void => {
    const { selectedDimensionField, onDimensionSelectionChange } = this.props;
    const index = selectedDimensionField.indexOf(item);
    const newItem: DimensionItem = {
      sequence: item.sequence,
      field: item.field,
      aggregationMethod: e.target.value,
    };
    if (e.target.value == "histogram") {
      newItem.interval = 5;
    }
    selectedDimensionField[index] = newItem;
    this.updateSequence(selectedDimensionField);
    onDimensionSelectionChange(selectedDimensionField);
  };

  onDimensionTableChange = ({ page: tablePage, sort }: Criteria<DimensionItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    const { selectedDimensionField } = this.props;
    this.setState({
      dimensionFrom: page * size,
      dimensionSize: size,
      dimensionSortField: sortField,
      dimensionSortDirection: sortDirection,
      dimensionsShown: selectedDimensionField.slice(page * size, page * size + size),
    });
  };

  render() {
    const { fieldsOption, selectedDimensionField } = this.props;
    const {
      allSelectedFields,
      isModalVisible,
      dimensionFrom,
      dimensionSize,
      dimensionSortDirection,
      dimensionSortField,
      dimensionsShown,
    } = this.state;
    const dimensionPage = Math.floor(dimensionFrom / dimensionSize);

    const dimensionPagination: Pagination = {
      pageIndex: dimensionPage,
      pageSize: dimensionSize,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: selectedDimensionField.length,
    };

    const dimensionSorting: EuiTableSortingType<DimensionItem> = {
      sort: {
        direction: dimensionSortDirection,
        field: dimensionSortField,
      },
    };

    const selection: EuiTableSelectionType<FieldItem> = {
      onSelectionChange: this.onSelectionChange,
      initialSelected: allSelectedFields,
    };

    const aggregationColumns: EuiTableFieldDataColumnType<DimensionItem>[] = [
      {
        field: "sequence",
        name: "Sequence",
        sortable: true,
        dataType: "number",
        align: "left",
      },
      {
        field: "field.label",
        name: "Field name",
        align: "left",
      },
      {
        field: "field.type",
        name: "Field type",
        align: "left",
        render: (type) => (type == null ? "-" : type),
      },
      {
        field: "aggregationMethod",
        name: "Aggregation method",
        align: "left",
        render: (aggregationMethod, item) => (
          <EuiForm>
            <EuiCompressedFormRow>
              <EuiSelect
                compressed={true}
                value={aggregationMethod}
                disabled={!isNumericMapping(item.field.type)}
                options={[
                  { value: "terms", text: "Terms" },
                  { value: "histogram", text: "Histogram" },
                ]}
                onChange={(e) => this.onChangeAggregationMethod(e, item)}
                data-test-subj={`aggregationMethodSelect-${item.field.label}`}
              />
            </EuiCompressedFormRow>
          </EuiForm>
        ),
      },
      {
        field: "interval",
        name: "Interval",
        dataType: "number",
        align: "left",
        render: (interval: number, item) =>
          interval == null ? (
            "-"
          ) : (
            <EuiForm>
              <EuiCompressedFormRow>
                <EuiCompressedFieldNumber
                  min={1}
                  value={interval}
                  onChange={(e) => this.onChangeInterval(e, item)}
                  data-test-subj={`interval-${item.field.label}`}
                />
              </EuiCompressedFormRow>
            </EuiForm>
          ),
      },
      {
        field: "sequence",
        name: "",
        align: "center",
        render: (sequence, item: DimensionItem) => {
          return (
            <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                {item.sequence != 1 && (
                  <EuiLink color="primary" onClick={() => this.moveUp(item)} data-test-subj={`moveUp-${item.field.label}`}>
                    Move up
                  </EuiLink>
                )}
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                {item.sequence != selectedDimensionField.length && (
                  <EuiLink color="primary" onClick={() => this.moveDown(item)} data-test-subj={`moveDown-${item.field.label}`}>
                    Move down
                  </EuiLink>
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
          );
        },
      },

      {
        field: "sequence",
        name: "Actions",
        align: "center",
        render: (sequence, item: DimensionItem) => {
          return (
            <EuiIcon type="crossInACircleFilled" onClick={() => this.deleteField(item)} data-test-subj={`delete-${item.field.label}`} />
          );
        },
      },
    ];

    return (
      <EuiPanel>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="xs" direction="column">
              <EuiFlexItem>
                <EuiFlexGroup gutterSize="xs">
                  <EuiFlexItem grow={false}>
                    <EuiText size="s">
                      <h2>Additional aggregation{` (${selectedDimensionField.length})`} </h2>
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiText size="s" color="subdued">
                      <h2>
                        {" "}
                        <i>– optional</i>{" "}
                      </h2>
                    </EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormHelpText>
                  The sequence of fields may influence rollup performance.{" "}
                  <EuiLink external={true} href="https://opensearch.org/docs/latest/im-plugin/index-rollups/index/" target="_blank">
                    Learn more
                  </EuiLink>
                </EuiFormHelpText>
              </EuiFlexItem>
              {selectedDimensionField.length != 0 && (
                <Fragment>
                  <EuiFlexItem>
                    <EuiCallOut>
                      <EuiText size="s">
                        <p>
                          The order of fields impacts rollup performance. Aggregating by smaller buckets and then by larger buckets is
                          faster than the opposite. For example, if you are rolling up flight data for five airlines with 100 destinations,
                          aggregating by airline and then by destination is faster than aggregating by destination first.
                        </p>
                      </EuiText>
                    </EuiCallOut>
                    <EuiSpacer size="s" />
                  </EuiFlexItem>
                </Fragment>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="column" justifyContent="spaceBetween" style={{ padding: "0px 10px" }}>
              <EuiFlexItem grow={false}>
                <EuiSmallButton onClick={this.showModal} data-test-subj="addFieldsAggregation">
                  Add fields
                </EuiSmallButton>
              </EuiFlexItem>
              <EuiFlexItem> </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="s" />
        <EuiHorizontalRule margin="xs" />
        <EuiBasicTable
          items={dimensionsShown}
          itemId="sequence"
          columns={aggregationColumns}
          tableLayout="auto"
          hasActions={true}
          onChange={this.onDimensionTableChange}
          pagination={dimensionPagination}
          sorting={dimensionSorting}
          noItemsMessage={
            <Fragment>
              <EuiSpacer />
              <EuiText>No fields added for aggregations</EuiText>
              <EuiSpacer />
              <EuiFlexGroup style={{ padding: "5px 10px" }} alignItems="center">
                <EuiFlexItem>
                  <EuiSpacer />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiSmallButton onClick={this.showModal} data-test-subj="addFieldsAggregationEmpty">
                    Add fields
                  </EuiSmallButton>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiSpacer size="m" />
                </EuiFlexItem>
              </EuiFlexGroup>
            </Fragment>
          }
        />
        <EuiSpacer size="s" />
        {isModalVisible && (
          <EuiOverlayMask>
            <EuiModal onClose={this.closeModal} style={{ padding: "5px 30px" }}>
              <EuiModalHeader>
                <EuiModalHeaderTitle>Add fields</EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiModalBody>
                <EuiForm title="Add fields">
                  <EuiBasicTable
                    columns={AddFieldsColumns}
                    items={fieldsOption}
                    itemId="label"
                    rowHeader="fieldName"
                    noItemsMessage="No fields available"
                    isSelectable={true}
                    selection={selection}
                    tableLayout="fixed"
                  />
                </EuiForm>
              </EuiModalBody>

              <EuiModalFooter>
                <EuiSmallButtonEmpty onClick={this.closeModal} data-test-subj="addFieldsAggregationCancel">
                  Cancel
                </EuiSmallButtonEmpty>
                <EuiSmallButton
                  fill
                  onClick={() => {
                    this.closeModal();
                    this.onClickAdd();
                  }}
                  data-test-subj="addFieldsAggregationAdd"
                >
                  Add
                </EuiSmallButton>
              </EuiModalFooter>
            </EuiModal>
          </EuiOverlayMask>
        )}
      </EuiPanel>
    );
  }
}
