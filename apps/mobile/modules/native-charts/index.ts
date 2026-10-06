// Reexport the native module. On web, it will be resolved to NativeChartsModule.web.ts
// and on native platforms to NativeChartsModule.ts
export { default } from './src/NativeChartsModule';
export { default as NativeChartsView } from './src/NativeChartsView';
export * from  './src/NativeCharts.types';
