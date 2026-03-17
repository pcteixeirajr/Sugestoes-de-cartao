import 'package:flutter/material.dart';
import 'src/presentation/pages/home_page.dart';

class GiftCardApp extends StatelessWidget {
  const GiftCardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Sugestões de Cartão',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0B6E4F),
          primary: const Color(0xFF0B6E4F),
          secondary: const Color(0xFFD9A441),
          surface: const Color(0xFFF6F1E8),
        ),
        scaffoldBackgroundColor: const Color(0xFFF6F1E8),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}
