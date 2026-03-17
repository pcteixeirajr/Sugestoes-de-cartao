import 'package:flutter/foundation.dart';
import '../../data/api/message_api_client.dart';
import '../../domain/message_suggestion_result.dart';

enum MessageSuggesterStatus {
  idle,
  loading,
  success,
  error,
}

class MessageSuggesterController extends ChangeNotifier {
  MessageSuggesterController({MessageApiClient? apiClient})
      : _apiClient = apiClient ?? MessageApiClient();

  final MessageApiClient _apiClient;

  MessageSuggesterStatus status = MessageSuggesterStatus.idle;
  MessageSuggestionResult? result;
  String? errorMessage;

  Future<void> submit({
    required String occasion,
    required String relationship,
  }) async {
    status = MessageSuggesterStatus.loading;
    result = null;
    errorMessage = null;
    notifyListeners();

    try {
      result = await _apiClient.fetchSuggestions(
        occasion: occasion,
        relationship: relationship,
      );
      status = MessageSuggesterStatus.success;
    } on MessageApiException catch (error) {
      status = MessageSuggesterStatus.error;
      errorMessage = error.message;
    } catch (_) {
      status = MessageSuggesterStatus.error;
      errorMessage =
          'Ocorreu um erro inesperado ao buscar sugestões. Tente novamente.';
    }

    notifyListeners();
  }
}
