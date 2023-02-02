export interface DataStreamStats {
  backing_indices: number;
  data_stream: string;
  maximum_timestamp: number;
  store_size?: string;
  store_size_bytes: string;
}
