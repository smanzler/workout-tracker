import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './NativeCharts.types';

type NativeChartsModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class NativeChartsModule extends NativeModule<NativeChartsModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(NativeChartsModule, "NativeCharts");
