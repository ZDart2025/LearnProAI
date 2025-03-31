import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:learnpro/core/View/NoInternetScreen.dart';

import 'package:learnpro/core/controllers/session_controller.dart'; // Session Controller
import 'package:learnpro/core/splash_screen.dart';
import 'package:learnpro/feature/auth/presentation/pages/GettingStarted%20page.dart';
import 'package:learnpro/feature/auth/presentation/pages/login_page.dart'; // Login Page
import 'package:learnpro/feature/landing_page.dart'; // Landing Page
import 'package:learnpro/feature/landing_page_controller.dart';
import 'package:learnpro/utils/theme/themes.dart'; // App theme
import 'package:learnpro/core/controllers/connectivity_controller.dart'; // Add the ConnectivityController
import 'package:flutter/services.dart'; // Add this import for controlling orientation

void main() async {
  WidgetsFlutterBinding
      .ensureInitialized(); // Ensure initialization before using SharedPreferences

  // Lock the app to portrait mode
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp, // Portrait mode
    DeviceOrientation.portraitDown, // In case the device is upside down
  ]);

  Get.put(LandingPageController());
  Get.put(SessionController()); // Ensure it is available globally
  Get.put(ConnectivityController());

  runApp(const LearnPro());
}

class LearnPro extends StatelessWidget {
  const LearnPro({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'learnpro',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      initialRoute: '/',
      getPages: [
        GetPage(name: '/', page: () => SplashScreen()),
        GetPage(name: '/landing', page: () => LandingPage()),
        GetPage(name: '/login', page: () => LoginPage()), // Must be defined
        GetPage(name: '/start', page: () => GetStartedPage()),
        GetPage(
            name: '/noInternet', page: () => NoInternetScreen()), // Add route
      ],
    );
  }
}
