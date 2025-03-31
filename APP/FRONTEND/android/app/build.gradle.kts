plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.zdart.learnpro"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = "27.0.12077973"

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        applicationId = "com.zdart.learnpro"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }
        signingConfigs {
        getByName("debug") {
            keyAlias = "androiddebugkey"
            keyPassword = "android"
            storeFile = file("./debug.keystore")
            storePassword = "android"
        }
        // create("release") {
        //     keyAlias = "chelladurai"
        //     keyPassword = "Outdid@123"
        //     storeFile = file("./my-release-key.keystore")
        //     storePassword = "Outdid@123"
        // }
    }

    buildTypes {
        // release {
        //     signingConfig = signingConfigs.getByName("debug")
        // }

        debug {
            signingConfig = signingConfigs.getByName("debug")  
        }
    }


}

flutter {
    source = "../.."
}
