import 'package:flutter_test/flutter_test.dart';
import 'package:gift_card_message_suggester/app.dart';

void main() {
  testWidgets('renders the main gift card experience', (tester) async {
    await tester.pumpWidget(const GiftCardApp());

    expect(find.text('Sugestões de mensagem com IA'), findsOneWidget);
    expect(find.text('Gerar sugestões'), findsOneWidget);
    expect(find.text('Ocasião'), findsOneWidget);
    expect(find.text('Relação'), findsOneWidget);
  });
}
