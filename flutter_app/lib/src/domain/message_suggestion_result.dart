class MessageSuggestionResult {
  const MessageSuggestionResult({
    required this.suggestions,
    required this.source,
    this.warning,
  });

  final List<String> suggestions;
  final String source;
  final String? warning;

  factory MessageSuggestionResult.fromJson(Map<String, dynamic> json) {
    final rawSuggestions = json['suggestions'] as List<dynamic>? ?? const [];

    return MessageSuggestionResult(
      suggestions: rawSuggestions.map((item) => item.toString()).toList(),
      source: json['source']?.toString() ?? 'fallback',
      warning: json['warning']?.toString(),
    );
  }
}
