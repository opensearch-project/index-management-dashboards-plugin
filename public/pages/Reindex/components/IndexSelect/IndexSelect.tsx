/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiComboBoxOptionOption } from "@elastic/eui";
import { CoreStart } from "opensearch-dashboards/public";
import React, { useContext, useEffect, useState } from "react";
import { CatIndex } from "../../../../../server/models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";

interface IndexSelectProps {
  getIndexOptions: (searchValue: string) => Promise<EuiComboBoxOptionOption<CatIndex>[]>;
  onSelectedOptions: (options: EuiComboBoxOptionOption<CatIndex>[]) => void;
  singleSelect: boolean;
  selectedOption: EuiComboBoxOptionOption<CatIndex>[];
}

export default function IndexSelect(props: IndexSelectProps) {
  const initPipeline: EuiComboBoxOptionOption<CatIndex>[] = [];
  const [indexOptions, setIndexOptions] = useState(initPipeline);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  useEffect(() => {
    props
      .getIndexOptions("")
      .then((options) => {
        setIndexOptions(options);
      })
      .catch((err) => {
        coreServices.notifications.toasts.addDanger(`fetch pipelines error ${err}`);
      });
  }, [props.getIndexOptions]);

  const onSearchChange = async (searchValue: string) => {
    if (searchValue.trim()) {
      props.getIndexOptions(searchValue).then((options) => {
        setIndexOptions(options);
      });
    }
  };

  return (
    <div>
      <EuiComboBox
        placeholder="Select indexes or data streams"
        options={indexOptions}
        async
        selectedOptions={props.selectedOption}
        onChange={props.onSelectedOptions}
        onSearchChange={onSearchChange}
        isClearable={true}
        singleSelection={props.singleSelect ? { asPlainText: true } : false}
        data-test-subj="indexSelectComboBox"
      />
    </div>
  );
}
