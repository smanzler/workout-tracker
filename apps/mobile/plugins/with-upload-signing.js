// @ts-check
const { withAppBuildGradle } = require("expo/config-plugins");

const marker = "repUploadStoreFile";

const releaseSigningConfig = `signingConfigs {
        release {
            if (findProperty('${marker}')) {
                storeFile file(findProperty('${marker}'))
                storePassword findProperty('repUploadStorePassword')
                keyAlias findProperty('repUploadKeyAlias')
                keyPassword findProperty('repUploadKeyPassword')
            }
        }`;

const debugReleaseSigning =
  /(buildTypes\s*{[\s\S]*?release\s*{[\s\S]*?)signingConfig signingConfigs\.debug/;

/**
 * Signs release builds with the upload key in the `repUpload*` Gradle
 * properties. Without them, release builds use the debug key.
 *
 * @type {import("expo/config-plugins").ConfigPlugin}
 */
module.exports = (config) =>
  withAppBuildGradle(config, (config) => {
    const gradle = config.modResults.contents;
    if (gradle.includes(marker)) return config;
    if (
      !gradle.includes("signingConfigs {") ||
      !debugReleaseSigning.test(gradle)
    ) {
      throw new Error(
        "with-upload-signing: app/build.gradle has an unknown format",
      );
    }
    config.modResults.contents = gradle
      .replace("signingConfigs {", releaseSigningConfig)
      .replace(
        debugReleaseSigning,
        `$1signingConfig findProperty('${marker}') ? signingConfigs.release : signingConfigs.debug`,
      );
    return config;
  });
