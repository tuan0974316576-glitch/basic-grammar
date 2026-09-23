plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val dopeReleaseKeystorePath = System.getenv("DOPE_KEYSTORE_FILE")
val dopeReleaseKeyAlias = System.getenv("DOPE_KEY_ALIAS")
val dopeReleaseStorePassword = System.getenv("DOPE_STORE_PASSWORD")
val dopeReleaseKeyPassword = System.getenv("DOPE_KEY_PASSWORD")
val dopeReleaseSigningAvailable = listOf(
    dopeReleaseKeystorePath,
    dopeReleaseKeyAlias,
    dopeReleaseStorePassword,
    dopeReleaseKeyPassword,
).all { !it.isNullOrBlank() }
val dopeDebugSigningExplicitlyAllowed =
    System.getenv("DOPE_ALLOW_DEBUG_SIGNING") == "true"

android {
    namespace = "com.enguistics.dope_english"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.enguistics.dope_english"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        // Uses the version code from pubspec.yaml. When using split APKs, 1000 * ABI_VERSION
        // is added automatically by Flutter. (https://developer.android.com/studio/build/configure-apk-splits#configure-APK-versions)
        // You can force using the value of versionCode by specifying the `-P force-version-code-ignoring-abi=true`
        // flag during build.
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        create("release") {
            if (dopeReleaseSigningAvailable) {
                storeFile = file(dopeReleaseKeystorePath!!)
                storePassword = dopeReleaseStorePassword
                keyAlias = dopeReleaseKeyAlias
                keyPassword = dopeReleaseKeyPassword
            }
        }
    }

    buildTypes {
        release {
            if (!dopeReleaseSigningAvailable && !dopeDebugSigningExplicitlyAllowed) {
                throw GradleException(
                    "DOPE release signing key is missing. Set DOPE_KEYSTORE_FILE, " +
                        "DOPE_KEY_ALIAS, DOPE_STORE_PASSWORD, and DOPE_KEY_PASSWORD " +
                        "or explicitly set DOPE_ALLOW_DEBUG_SIGNING=true for a " +
                        "non-Play local build.",
                )
            }
            signingConfig = if (dopeReleaseSigningAvailable) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
