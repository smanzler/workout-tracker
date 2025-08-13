import * as React from 'react';

import { NativeChartsViewProps } from './NativeCharts.types';

export default function NativeChartsView(props: NativeChartsViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
