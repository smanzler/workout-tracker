import { requireNativeView } from 'expo';
import * as React from 'react';

import { NativeChartsViewProps } from './NativeCharts.types';

const NativeView: React.ComponentType<NativeChartsViewProps> =
  requireNativeView('NativeCharts');

export default function NativeChartsView(props: NativeChartsViewProps) {
  return <NativeView {...props} />;
}
