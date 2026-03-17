import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../config/app_config.dart';
import '../../domain/message_suggestion_result.dart';

class MessageApiClient {
  MessageApiClient({http.Client? httpClient})
      : _httpClient = httpClient ?? http.Client();

  final http.Client _httpClient;

  Future<MessageSuggestionResult> fetchSuggestions({
    required String occasion,
    required String relationship,
  }) async {
    final uri = Uri.parse(
      '${AppConfig.apiBaseUrl}/api/v1/message-suggestions',
    );

    final response = await _httpClient.post(
      uri,
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({
        'occasion': occasion,
        'relationship': relationship,
      }),
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 400) {
      throw MessageApiException(
        body['message']?.toString() ??
            'Não foi possível buscar sugestões no momento.',
      );
    }

    return MessageSuggestionResult.fromJson(body);
  }
}

class MessageApiException implements Exception {
  MessageApiException(this.message);

  final String message;

  @override
  String toString() => message;
}
