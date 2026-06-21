import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static const Color bg = Color(0xFF070B14);
  static const Color surface = Color(0xFF0D1526);
  static const Color surfaceElevated = Color(0xFF111D35);
  static const Color primary = Color(0xFF3A8EFF);
  static const Color primaryDim = Color(0xFF1A5ACC);
  static const Color accent = Color(0xFF58B0FF);
  static const Color textPrimary = Color(0xFFD0E4FF);
  static const Color textSecondary = Color(0xFF6080A8);
  static const Color textDim = Color(0xFF3A5270);
  static const Color border = Color(0xFF1A3060);
  static const Color borderDim = Color(0xFF0F1E40);
  static const Color pipeColor = Color(0xFF8FA8BE);
  static const Color error = Color(0xFFFF5555);

  static ThemeData get dark => ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: bg,
    colorScheme: const ColorScheme.dark(
      primary: primary,
      secondary: accent,
      surface: surface,
      error: error,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF09101E),
      foregroundColor: textPrimary,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: textPrimary,
        letterSpacing: 0.3,
      ),
    ),
    textTheme: const TextTheme(
      headlineMedium: TextStyle(color: textPrimary, fontWeight: FontWeight.w700),
      titleLarge: TextStyle(color: textPrimary, fontWeight: FontWeight.w600),
      titleMedium: TextStyle(color: textPrimary, fontWeight: FontWeight.w500),
      bodyLarge: TextStyle(color: textSecondary),
      bodyMedium: TextStyle(color: textSecondary),
      labelSmall: TextStyle(color: textDim, letterSpacing: 0.1),
    ),
    dividerTheme: const DividerThemeData(color: borderDim, thickness: 1),
    cardTheme: CardThemeData(
      color: surfaceElevated,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: borderDim),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
  );
}

// 공통 스타일 상수
class AppDimens {
  AppDimens._();
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 18;
  static const double radiusXl = 24;
  static const double padSm = 12;
  static const double padMd = 16;
  static const double padLg = 24;
}
