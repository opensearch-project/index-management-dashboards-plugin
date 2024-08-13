import { EuiLink } from "@elastic/eui";

import React from "react";

export interface UIProps {
  cssClassName: string;
}

export function ExternalLink(props: { href: string }) {
  return (
    <EuiLink external={true} href={props.href} target="_blank" className="external-link-inline-block">
      Learn more.
    </EuiLink>
  );
}
