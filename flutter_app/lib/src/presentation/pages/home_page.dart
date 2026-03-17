import 'package:flutter/material.dart';
import '../controllers/message_suggester_controller.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _occasionController = TextEditingController(text: 'Aniversário');
  final _relationshipController = TextEditingController(text: 'Amiga');
  final _formKey = GlobalKey<FormState>();
  late final MessageSuggesterController _controller;

  @override
  void initState() {
    super.initState();
    _controller = MessageSuggesterController()..addListener(_onControllerChanged);
  }

  @override
  void dispose() {
    _controller
      ..removeListener(_onControllerChanged)
      ..dispose();
    _occasionController.dispose();
    _relationshipController.dispose();
    super.dispose();
  }

  void _onControllerChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    await _controller.submit(
      occasion: _occasionController.text.trim(),
      relationship: _relationshipController.text.trim(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 720),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0B6E4F), Color(0xFF145A32)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(28),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Sugestões de mensagem com IA',
                          style: theme.textTheme.headlineMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Preencha a ocasião e a relação com a pessoa para gerar mensagens curtas, naturais e prontas para cartão.',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: Colors.white.withValues(alpha: 0.92),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Card(
                    elevation: 0,
                    color: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            TextFormField(
                              controller: _occasionController,
                              decoration: const InputDecoration(
                                labelText: 'Ocasião',
                                hintText: 'Ex.: Aniversário, casamento, agradecimento',
                              ),
                              validator: _validateField,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _relationshipController,
                              decoration: const InputDecoration(
                                labelText: 'Relação',
                                hintText: 'Ex.: Amiga, colega de trabalho, mãe',
                              ),
                              validator: _validateField,
                            ),
                            const SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton(
                                onPressed: _controller.status == MessageSuggesterStatus.loading
                                    ? null
                                    : _handleSubmit,
                                style: FilledButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 18),
                                ),
                                child: _controller.status == MessageSuggesterStatus.loading
                                    ? const SizedBox(
                                        height: 22,
                                        width: 22,
                                        child: CircularProgressIndicator(strokeWidth: 2),
                                      )
                                    : const Text('Gerar sugestões'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildResultSection(theme),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResultSection(ThemeData theme) {
    switch (_controller.status) {
      case MessageSuggesterStatus.idle:
        return _InfoCard(
          title: 'Pronto para testar',
          description:
              'Use o fluxo sugerido no desafio: Aniversário + Amiga. Em seguida, experimente combinações como casamento + irmão ou agradecimento + colega.',
        );
      case MessageSuggesterStatus.loading:
        return const _InfoCard(
          title: 'Gerando mensagens',
          description: 'Estamos consultando o backend e preparando sugestões personalizadas.',
        );
      case MessageSuggesterStatus.error:
        return _FeedbackCard(
          title: 'Não foi possível concluir',
          description: _controller.errorMessage ?? 'Erro inesperado.',
          tone: _FeedbackTone.error,
        );
      case MessageSuggesterStatus.success:
        final result = _controller.result;
        if (result == null) {
          return const SizedBox.shrink();
        }

        return Card(
          elevation: 0,
          color: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  result.source == 'fallback'
                      ? 'Sugestões locais de contingência'
                      : 'Sugestões geradas por IA',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (result.warning != null) ...[
                  const SizedBox(height: 12),
                  _FeedbackCard(
                    title: 'Aviso',
                    description: result.warning!,
                    tone: _FeedbackTone.warning,
                  ),
                ],
                const SizedBox(height: 16),
                for (var i = 0; i < result.suggestions.length; i++) ...[
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8F4EC),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFE7DBC5)),
                    ),
                    child: Text(
                      '${i + 1}. ${result.suggestions[i]}',
                      style: theme.textTheme.bodyLarge?.copyWith(height: 1.45),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
    }
  }

  String? _validateField(String? value) {
    final normalized = value?.trim() ?? '';
    if (normalized.length < 2) {
      return 'Preencha este campo com pelo menos 2 caracteres.';
    }
    if (normalized.length > 60) {
      return 'Use no máximo 60 caracteres.';
    }
    return null;
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.title,
    required this.description,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return _FeedbackCard(
      title: title,
      description: description,
      tone: _FeedbackTone.neutral,
    );
  }
}

enum _FeedbackTone { neutral, warning, error }

class _FeedbackCard extends StatelessWidget {
  const _FeedbackCard({
    required this.title,
    required this.description,
    required this.tone,
  });

  final String title;
  final String description;
  final _FeedbackTone tone;

  @override
  Widget build(BuildContext context) {
    final colors = switch (tone) {
      _FeedbackTone.neutral => (
          background: const Color(0xFFEFF6F2),
          border: const Color(0xFFD6E8DE),
          icon: const Color(0xFF0B6E4F),
        ),
      _FeedbackTone.warning => (
          background: const Color(0xFFFFF4DD),
          border: const Color(0xFFF2D7A4),
          icon: const Color(0xFF9A6700),
        ),
      _FeedbackTone.error => (
          background: const Color(0xFFFDECEC),
          border: const Color(0xFFF0C9C9),
          icon: const Color(0xFFB42318),
        ),
    };

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: colors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, color: colors.icon),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        height: 1.4,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
