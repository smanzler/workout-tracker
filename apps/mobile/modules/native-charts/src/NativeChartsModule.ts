import { NativeModule, requireNativeModule } from 'expo';

import { NativeChartsModuleEvents } from './NativeCharts.types';

declare class NativeChartsModule extends NativeModule<NativeChartsModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<NativeChartsModule>('NativeCharts');
