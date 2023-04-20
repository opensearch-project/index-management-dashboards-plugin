// @ts-ignore
import { factory } from "elasticsearch/src/lib/client_action";
import { API } from "../utils/constants";
export function extendClient(props: { ism: any; ca: typeof factory }) {
  const { ism, ca } = props;
  ism.getPolicy = ca({
    url: {
      fmt: `${API.POLICY_BASE}/<%=policyId%>`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.getPolicies = ca({
    url: {
      fmt: `${API.POLICY_BASE}`,
    },
    method: "GET",
  });

  ism.createPolicy = ca({
    url: {
      fmt: `${API.POLICY_BASE}/<%=policyId%>?refresh=wait_for`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "PUT",
  });

  ism.deletePolicy = ca({
    url: {
      fmt: `${API.POLICY_BASE}/<%=policyId%>?refresh=wait_for`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "DELETE",
  });

  ism.putPolicy = ca({
    url: {
      fmt: `${API.POLICY_BASE}/<%=policyId%>?if_seq_no=<%=ifSeqNo%>&if_primary_term=<%=ifPrimaryTerm%>&refresh=wait_for`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
        ifSeqNo: {
          type: "string",
          required: true,
        },
        ifPrimaryTerm: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "PUT",
  });

  ism.explain = ca({
    url: {
      fmt: `${API.EXPLAIN_BASE}/<%=index%>`,
      req: {
        index: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.explainAll = ca({
    url: {
      fmt: `${API.EXPLAIN_BASE}`,
    },
    method: "GET",
  });

  ism.retry = ca({
    url: {
      fmt: `${API.RETRY_BASE}/<%=index%>`,
      req: {
        index: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: false,
    method: "POST",
  });

  ism.add = ca({
    url: {
      fmt: `${API.ADD_POLICY_BASE}/<%=index%>`,
      req: {
        index: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "POST",
  });

  ism.remove = ca({
    url: {
      fmt: `${API.REMOVE_POLICY_BASE}/<%=index%>`,
      req: {
        index: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: false,
    method: "POST",
  });

  ism.change = ca({
    url: {
      fmt: `${API.CHANGE_POLICY_BASE}/<%=index%>`,
      req: {
        index: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "POST",
  });

  // TODO add new APIs as they are being implemented: status, stop, start

  ism.getRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.getRollups = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}`,
    },
    method: "GET",
  });

  ism.createRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>?refresh=wait_for`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "PUT",
  });

  ism.deleteRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>?refresh=wait_for`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "DELETE",
  });

  ism.putRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "PUT",
  });

  ism.startRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>/_start`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "POST",
  });

  ism.stopRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>/_stop`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "POST",
  });

  ism.explainRollup = ca({
    url: {
      fmt: `${API.ROLLUP_JOBS_BASE}/<%=rollupId%>/_explain`,
      req: {
        rollupId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.getTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.getTransforms = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/`,
    },
    method: "GET",
  });

  ism.explainTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>/_explain`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.startTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>/_start`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "POST",
  });

  ism.stopTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>/_stop`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "POST",
  });

  ism.deleteTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "DELETE",
  });

  ism.createTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>?refresh=wait_for`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "PUT",
  });

  ism.putTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/<%=transformId%>`,
      req: {
        transformId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "PUT",
  });

  ism.previewTransform = ca({
    url: {
      fmt: `${API.TRANSFORM_BASE}/_preview`,
    },
    needBody: true,
    method: "POST",
  });

  ism.getChannels = ca({
    url: {
      fmt: `${API.CHANNELS_BASE}`,
    },
    method: "GET",
  });

  ism.getChannel = ca({
    url: {
      fmt: `${API.NOTIFICATION_CONFIGS_BASE}/<%=id%>`,
      req: {
        id: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.getSMPolicy = ca({
    url: {
      fmt: `${API.SM_POLICY_BASE}/<%=id%>`,
      req: {
        id: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.getSMPolicies = ca({
    url: {
      fmt: `${API.SM_POLICY_BASE}`,
    },
    method: "GET",
  });

  ism.createSMPolicy = ca({
    url: {
      fmt: `${API.SM_POLICY_BASE}/<%=policyId%>?refresh=wait_for`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "POST",
  });

  ism.updateSMPolicy = ca({
    url: {
      fmt: `${API.SM_POLICY_BASE}/<%=policyId%>?if_seq_no=<%=ifSeqNo%>&if_primary_term=<%=ifPrimaryTerm%>&refresh=wait_for`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
        ifSeqNo: {
          type: "string",
          required: true,
        },
        ifPrimaryTerm: {
          type: "string",
          required: true,
        },
      },
    },
    needBody: true,
    method: "PUT",
  });

  ism.deleteSMPolicy = ca({
    url: {
      fmt: `${API.SM_POLICY_BASE}/<%=policyId%>?refresh=wait_for`,
      req: {
        policyId: {
          type: "string",
          required: true,
        },
      },
    },
    method: "DELETE",
  });

  ism.explainSnapshotPolicy = ca({
    url: {
      fmt: `${API.SM_POLICY_BASE}/<%=id%>/_explain`,
      req: {
        id: {
          type: "string",
          required: true,
        },
      },
    },
    method: "GET",
  });

  ism.startSnapshotPolicy = ca({
    url: {
      fmt: `${API.SM_POLICY_BASE}/<%=id%>/_start`,
      req: {
        id: {
          type: "string",
          required: true,
        },
      },
    },
    method: "POST",
  });

  ism.stopSnapshotPolicy = ca({
    url: {
      fmt: `${API.SM_POLICY_BASE}/<%=id%>/_stop`,
      req: {
        id: {
          type: "string",
          required: true,
        },
      },
    },
    method: "POST",
  });
}
