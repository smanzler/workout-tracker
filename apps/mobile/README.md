# Rep mobile app

The Expo app. See the root `README.md` to run it.

## Store listing

The App Store and Play Store listing text and screenshots live in `fastlane`, and fastlane uploads them. iOS builds and release notes still go through EAS. Android builds are local, see [Android releases](#android-releases).

- `fastlane/metadata/ios` is in [deliver](https://docs.fastlane.tools/actions/deliver/) format. The ios lane needs a version in "Prepare for Submission" on App Store Connect.
- `fastlane/metadata/android` is in [supply](https://docs.fastlane.tools/actions/supply/) format. The title and full description are symlinks to the iOS name and description.

### Screenshots

Add PNG or JPEG files, in display order (e.g. `01-workout.png`):

- **iOS:** `fastlane/screenshots/ios/en-US`. deliver reads the device from the image size. The app supports iPad, so the App Store needs a 6.9" iPhone set (1320×2868 or 1290×2796) and a 13" iPad set (2064×2752 or 2048×2732).
- **Android:** `fastlane/metadata/android/en-US/images/phoneScreenshots`, 2 to 8 images, 320 to 3840 px per side.

An upload replaces the store's screenshots only for the languages (iOS) or screenshot types (Android) that have files here, so an empty folder leaves the store as it is. On iOS, it replaces the screenshots of every device in that language, so always keep the iPhone and iPad sets together.

#### Capturing screenshots

The screenshots lanes build a release version of the app and run the [Maestro](https://maestro.dev) flow in `.maestro/screenshots.yaml`. The flow signs in as the store review account, starts its first routine, completes two sets and then discards the workout. Then it captures History, the newest workout, Bench Press (Barbell) and the Friends feed. The images show that account's real data, so first give it a profile, a routine, a few workouts with Bench Press (Barbell), and friends who have workouts.

You need Maestro and a `.env.production` like the one used for release builds. A release build talks to the API in that file, so put the review account's `REVIEW_EMAIL` and `REVIEW_OTP` for that API there too. `--env production` makes fastlane read them. Then, from `apps/mobile`:

```bash
# Boots an "iPhone 17 Pro Max" and an "iPad Pro 13-inch (M5)" simulator.
# Use others of the same sizes with iphone:"…" and ipad:"…"
bundle exec fastlane ios screenshots --env production
# Uses the one running Android emulator
bundle exec fastlane android screenshots --env production
```

Each lane replaces the images in its screenshots folder. Review them and commit them, then upload them with the metadata lanes.

To push a change, run the **Store Metadata** GitHub workflow. To run it locally from `apps/mobile`:

```bash
bundle install
bundle exec fastlane ios metadata
bundle exec fastlane android metadata
```

The lanes read these env vars:

| Variable                                                         | Lane                      | Value                                                                         |
| ---------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| `APP_STORE_CONNECT_API_KEY_KEY_ID`                               | ios metadata              | Key ID of an App Store Connect API key with the App Manager role              |
| `APP_STORE_CONNECT_API_KEY_ISSUER_ID`                            | ios metadata              | Issuer ID shown above the API keys list                                       |
| `APP_STORE_CONNECT_API_KEY_KEY`                                  | ios metadata              | Contents of the key's `.p8` file                                              |
| `REVIEW_EMAIL`, `REVIEW_OTP`                                     | ios metadata, screenshots | The store review account, as set on the API                                   |
| `REVIEW_CONTACT_FIRST_NAME`, `…_LAST_NAME`, `…_EMAIL`, `…_PHONE` | ios metadata              | The App Review contact. The phone starts with `+` and the country code        |
| `SUPPLY_JSON_KEY_DATA`                                           | android metadata          | JSON key of a Google Cloud service account with access to the app in Play     |
| `ANDROID_UPLOAD_STORE_FILE`, `…_STORE_PASSWORD`                  | android release           | The upload keystore and its password. A relative path starts at `apps/mobile` |
| `ANDROID_UPLOAD_KEY_ALIAS`, `…_KEY_PASSWORD`                     | android release           | The upload key in that keystore and its password                              |

## Android releases

`fastlane android release` builds a signed `.aab` with Gradle and uploads it to the internal track. Put the env vars from the table above in `.env.production`. Then, from `apps/mobile`:

```bash
bundle exec fastlane android release --env production
```

The lane gets the highest version code on Play and adds 1. The release build talks to the API in `.env.production`. Promote the release to other tracks in Play Console.

Make the upload keystore one time, and keep it and its password out of the repo. Play App Signing signs the app for users, so Play support can reset a lost upload key.

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore ~/.android/rep-upload.jks \
  -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

Play does not let the API make the first release. For it, build without the upload, then upload `android/app/build/outputs/bundle/release/app-release.aab` in Play Console under Testing → Internal testing:

```bash
bundle exec fastlane android release --env production version_code:1 upload:false
```
