import 'dart:async';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/stationery_frame.dart';
import 'student_auth_controller.dart';

class StudentLoginScreen extends StatefulWidget {
  const StudentLoginScreen({required this.controller, super.key});

  final StudentAuthController controller;

  @override
  State<StudentLoginScreen> createState() => _StudentLoginScreenState();
}

class _StudentLoginScreenState extends State<StudentLoginScreen> {
  final _studentIdController = TextEditingController();
  final _pinController = TextEditingController();
  final _studentIdFocusNode = FocusNode();
  final _pinFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_refresh);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_refresh);
    _studentIdController.dispose();
    _pinController.dispose();
    _studentIdFocusNode.dispose();
    _pinFocusNode.dispose();
    super.dispose();
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  Future<void> _login() async {
    if (widget.controller.isSubmitting) return;
    // Close the IME before the auth state swaps this screen for AppShell. On
    // Android, rebuilding during an active IME resize can preserve a half-height
    // viewport and leave the authenticated content above the visible tab bar.
    FocusManager.instance.primaryFocus?.unfocus();
    await SystemChannels.textInput.invokeMethod<void>('TextInput.hide');
    await Future<void>.delayed(const Duration(milliseconds: 120));
    final success = await widget.controller.login(
      studentId: _studentIdController.text,
      pin: _pinController.text,
    );
    if (!mounted) return;
    unawaited(AppSfx.instance.play(success ? SfxCue.correct : SfxCue.wrong));
    if (success) {
      FocusManager.instance.primaryFocus?.unfocus();
      await SystemChannels.textInput.invokeMethod<void>('TextInput.hide');
    }
    if (!success) {
      _pinController.clear();
      _pinFocusNode.requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFB9C1C2),
      resizeToAvoidBottomInset: true,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const _BlurredGrammarBackdrop(),
          SafeArea(
            child: SingleChildScrollView(
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 24),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 560),
                  child: StationeryFrame(
                    padding: const EdgeInsets.fromLTRB(22, 22, 22, 24),
                    backgroundColor: AppPalette.paper,
                    radius: 24,
                    ringWidth: 5,
                    shadowDepth: 7,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const _LoginHeader(),
                        const SizedBox(height: 12),
                        _LoginStatus(
                          message: widget.controller.message,
                          isError: widget.controller.status ==
                                  StudentAuthStatus.unavailable ||
                              widget.controller.message.contains('不正確') ||
                              widget.controller.message.contains('未能') ||
                              widget.controller.message.contains('請輸入正確'),
                        ),
                        const SizedBox(height: 14),
                        _LoginFields(
                          studentIdController: _studentIdController,
                          pinController: _pinController,
                          studentIdFocusNode: _studentIdFocusNode,
                          pinFocusNode: _pinFocusNode,
                          onSubmit: _login,
                        ),
                        const SizedBox(height: 18),
                        FilledButton(
                          key: const Key('student-login-button'),
                          onPressed:
                              widget.controller.isSubmitting ? null : _login,
                          style: FilledButton.styleFrom(
                            minimumSize: const Size.fromHeight(58),
                            backgroundColor: AppPalette.secondary,
                            foregroundColor: const Color(0xFF594512),
                            disabledBackgroundColor: AppPalette.border,
                            shape: const StadiumBorder(
                              side: BorderSide(
                                color: AppPalette.secondaryDark,
                                width: 2,
                              ),
                            ),
                          ),
                          child: widget.controller.isSubmitting
                              ? const SizedBox.square(
                                  dimension: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 3,
                                    color: AppPalette.primaryDark,
                                  ),
                                )
                              : const Text(
                                  '登入',
                                  style: TextStyle(
                                    fontSize: 19,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BlurredGrammarBackdrop extends StatelessWidget {
  const _BlurredGrammarBackdrop();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Opacity(
          opacity: .2,
          child: Column(
            children: [
              const SizedBox(height: 72),
              const Text(
                'DOPE ENGLISH',
                style: TextStyle(
                  color: AppPalette.primaryDark,
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 10),
              Container(
                width: 360,
                height: 90,
                decoration: BoxDecoration(
                  color: AppPalette.softPrimary,
                  border: Border.all(color: AppPalette.primary, width: 3),
                  borderRadius: BorderRadius.circular(22),
                ),
              ),
              const SizedBox(height: 18),
              for (var index = 0; index < 4; index++)
                Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Container(
                    width: 410,
                    height: 96,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: AppPalette.border, width: 3),
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LoginHeader extends StatelessWidget {
  const _LoginHeader();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
          decoration: BoxDecoration(
            color: AppPalette.secondary,
            borderRadius: BorderRadius.circular(999),
            boxShadow: const [
              BoxShadow(color: AppPalette.secondaryDark, offset: Offset(0, 3)),
            ],
          ),
          child: const Text(
            'Student Account',
            style: TextStyle(
              color: Color(0xFF594512),
              fontSize: 14,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          '學生登入',
          style: TextStyle(
            color: AppPalette.primaryDark,
            fontSize: 34,
            height: 1.05,
            fontWeight: FontWeight.w900,
            shadows: [
              Shadow(color: AppPalette.softPrimary, offset: Offset(2, 2)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Container(height: 3, color: const Color(0xFFE7ECEE)),
      ],
    );
  }
}

class _LoginStatus extends StatelessWidget {
  const _LoginStatus({required this.message, required this.isError});

  final String message;
  final bool isError;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: isError ? AppPalette.softDanger : AppPalette.softSecondary,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isError ? AppPalette.danger : AppPalette.secondaryDark,
          width: 2,
        ),
        boxShadow: const [
          BoxShadow(color: Color(0xFFE9ECEF), offset: Offset(0, 3)),
        ],
      ),
      child: Text(
        message,
        textAlign: TextAlign.left,
        style: TextStyle(
          color: isError ? AppPalette.dangerDark : const Color(0xFF5D4037),
          fontSize: 14,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _LoginFields extends StatelessWidget {
  const _LoginFields({
    required this.studentIdController,
    required this.pinController,
    required this.studentIdFocusNode,
    required this.pinFocusNode,
    required this.onSubmit,
  });

  final TextEditingController studentIdController;
  final TextEditingController pinController;
  final FocusNode studentIdFocusNode;
  final FocusNode pinFocusNode;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          '學號',
          style: TextStyle(
            color: AppPalette.primaryDark,
            fontSize: 14,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 5),
        _LoginPaperField(
          child: TextField(
            key: const Key('student-id-field'),
            controller: studentIdController,
            focusNode: studentIdFocusNode,
            textCapitalization: TextCapitalization.characters,
            textInputAction: TextInputAction.next,
            autocorrect: false,
            enableSuggestions: false,
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9_-]')),
              LengthLimitingTextInputFormatter(16),
              TextInputFormatter.withFunction((oldValue, newValue) {
                return newValue.copyWith(
                  text: newValue.text.toUpperCase(),
                  composing: TextRange.empty,
                );
              }),
            ],
            onSubmitted: (_) => pinFocusNode.requestFocus(),
            decoration: const InputDecoration(
              hintText: '例如 S001',
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(horizontal: 4, vertical: 14),
            ),
            style: const TextStyle(
              color: Color(0xFF5D4037),
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'PIN',
          style: TextStyle(
            color: AppPalette.primaryDark,
            fontSize: 14,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 5),
        _LoginPaperField(
          child: TextField(
            key: const Key('student-pin-field'),
            controller: pinController,
            focusNode: pinFocusNode,
            obscureText: true,
            obscuringCharacter: '●',
            keyboardType: TextInputType.number,
            textInputAction: TextInputAction.done,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(8),
            ],
            onSubmitted: (_) => onSubmit(),
            decoration: const InputDecoration(
              hintText: '4-6 位數字',
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(horizontal: 4, vertical: 14),
            ),
            style: const TextStyle(
              color: Color(0xFF5D4037),
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ],
    );
  }
}

class _LoginPaperField extends StatelessWidget {
  const _LoginPaperField({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return StationeryFrame(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
      backgroundColor: const Color(0xFFFFFDF4),
      borderColor: AppPalette.primary,
      shadowColor: const Color(0xFFBDE0E1),
      radius: 15,
      ringWidth: 3,
      shadowDepth: 4,
      child: child,
    );
  }
}
