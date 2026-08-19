import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/game_keyboard.dart';
import 'student_auth_controller.dart';

enum _LoginField { studentId, pin }

class StudentLoginScreen extends StatefulWidget {
  const StudentLoginScreen({required this.controller, super.key});

  final StudentAuthController controller;

  @override
  State<StudentLoginScreen> createState() => _StudentLoginScreenState();
}

class _StudentLoginScreenState extends State<StudentLoginScreen> {
  final _studentIdController = TextEditingController();
  final _pinController = TextEditingController();
  _LoginField _activeField = _LoginField.studentId;

  bool get _usesSystemKeyboard {
    if (kIsWeb) return true;
    return switch (defaultTargetPlatform) {
      TargetPlatform.macOS ||
      TargetPlatform.windows ||
      TargetPlatform.linux =>
        true,
      _ => false,
    };
  }

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
    super.dispose();
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  void _activate(_LoginField field) {
    if (_activeField == field) return;
    unawaited(AppSfx.instance.play(SfxCue.click));
    setState(() => _activeField = field);
  }

  void _typeCharacter(String character) {
    final controller = _activeField == _LoginField.studentId
        ? _studentIdController
        : _pinController;
    final limit = _activeField == _LoginField.studentId ? 16 : 8;
    if (controller.text.length >= limit) return;
    final next = _activeField == _LoginField.studentId
        ? '${controller.text}$character'.toUpperCase()
        : '${controller.text}$character';
    controller.value = TextEditingValue(
      text: next,
      selection: TextSelection.collapsed(offset: next.length),
    );
    unawaited(AppSfx.instance.play(SfxCue.click));
    setState(() {});
  }

  void _backspace() {
    final controller = _activeField == _LoginField.studentId
        ? _studentIdController
        : _pinController;
    if (controller.text.isEmpty) return;
    final next = controller.text.substring(0, controller.text.length - 1);
    controller.value = TextEditingValue(
      text: next,
      selection: TextSelection.collapsed(offset: next.length),
    );
    unawaited(AppSfx.instance.play(SfxCue.click));
    setState(() {});
  }

  Future<void> _login() async {
    if (widget.controller.isSubmitting) return;
    final success = await widget.controller.login(
      studentId: _studentIdController.text,
      pin: _pinController.text,
    );
    if (!mounted) return;
    unawaited(AppSfx.instance.play(success ? SfxCue.correct : SfxCue.wrong));
    if (!success) {
      _pinController.clear();
      setState(() => _activeField = _LoginField.pin);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 12),
          child: Column(
            children: [
              const _LoginHeader(),
              const SizedBox(height: 12),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 560),
                child: Column(
                  children: [
                    _LoginStatus(
                      message: widget.controller.message,
                      isError: widget.controller.status ==
                              StudentAuthStatus.unavailable ||
                          widget.controller.message.contains('不正確') ||
                          widget.controller.message.contains('未能') ||
                          widget.controller.message.contains('請輸入正確'),
                    ),
                    const SizedBox(height: 10),
                    if (_usesSystemKeyboard)
                      _DesktopLoginFields(
                        studentIdController: _studentIdController,
                        pinController: _pinController,
                        onSubmit: _login,
                      )
                    else ...[
                      _GameLoginField(
                        key: const Key('student-id-field'),
                        label: '學號',
                        value: _studentIdController.text,
                        placeholder: '例如 S001',
                        active: _activeField == _LoginField.studentId,
                        onTap: () => _activate(_LoginField.studentId),
                      ),
                      const SizedBox(height: 9),
                      _GameLoginField(
                        key: const Key('student-pin-field'),
                        label: 'PIN',
                        value: _pinController.text,
                        placeholder: '4 至 8 位數字',
                        active: _activeField == _LoginField.pin,
                        obscure: true,
                        onTap: () => _activate(_LoginField.pin),
                      ),
                    ],
                    const SizedBox(height: 12),
                    FilledButton(
                      key: const Key('student-login-button'),
                      onPressed: widget.controller.isSubmitting ? null : _login,
                      style: FilledButton.styleFrom(
                        minimumSize: const Size.fromHeight(52),
                        backgroundColor: AppPalette.secondary,
                        foregroundColor: const Color(0xFF594512),
                        disabledBackgroundColor: AppPalette.border,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: const BorderSide(
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
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                    ),
                  ],
                ),
              ),
              if (!_usesSystemKeyboard) ...[
                const SizedBox(height: 12),
                Expanded(
                  child: Align(
                    alignment: Alignment.bottomCenter,
                    child: GameKeyboard(
                      key: const Key('student-login-game-keyboard'),
                      onCharacter: _typeCharacter,
                      onBackspace: _backspace,
                      onSubmit: _login,
                      showSubmit: false,
                      showNumberRow: _activeField == _LoginField.studentId,
                      numericOnly: _activeField == _LoginField.pin,
                      showSpace: false,
                      showApostrophe: false,
                      showUnderscore: _activeField == _LoginField.studentId,
                    ),
                  ),
                ),
              ],
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
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Transform.rotate(
          angle: -0.07,
          child: Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: AppPalette.softPrimary,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white, width: 3),
              boxShadow: const [
                BoxShadow(color: AppPalette.border, offset: Offset(0, 4)),
              ],
            ),
            child: const Icon(
              Icons.menu_book_rounded,
              color: AppPalette.primaryDark,
              size: 31,
            ),
          ),
        ),
        const SizedBox(width: 12),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'DOPE ENGLISH',
              style: TextStyle(
                color: AppPalette.primaryDark,
                fontSize: 23,
                fontWeight: FontWeight.w900,
              ),
            ),
            Text(
              '學生登入',
              style: TextStyle(
                color: AppPalette.ink,
                fontSize: 17,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: isError ? AppPalette.softDanger : AppPalette.softPrimary,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isError ? AppPalette.danger : AppPalette.primary,
          width: 1.5,
        ),
      ),
      child: Text(
        message,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: isError ? AppPalette.danger : AppPalette.primaryDark,
          fontSize: 13,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _GameLoginField extends StatelessWidget {
  const _GameLoginField({
    required this.label,
    required this.value,
    required this.placeholder,
    required this.active,
    required this.onTap,
    this.obscure = false,
    super.key,
  });

  final String label;
  final String value;
  final String placeholder;
  final bool active;
  final bool obscure;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: label,
      textField: true,
      child: Material(
        color: AppPalette.paper,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            height: 56,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: active ? AppPalette.primaryDark : AppPalette.border,
                width: active ? 2.5 : 2,
              ),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 52,
                  child: Text(
                    label,
                    style: const TextStyle(
                      color: AppPalette.primaryDark,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                Expanded(
                  child: Text(
                    value.isEmpty
                        ? placeholder
                        : obscure
                            ? '●' * value.length
                            : value,
                    style: TextStyle(
                      color: value.isEmpty ? AppPalette.muted : AppPalette.ink,
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DesktopLoginFields extends StatelessWidget {
  const _DesktopLoginFields({
    required this.studentIdController,
    required this.pinController,
    required this.onSubmit,
  });

  final TextEditingController studentIdController;
  final TextEditingController pinController;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    const border = OutlineInputBorder(
      borderRadius: BorderRadius.all(Radius.circular(12)),
      borderSide: BorderSide(color: AppPalette.border, width: 2),
    );
    return Column(
      children: [
        TextField(
          controller: studentIdController,
          textCapitalization: TextCapitalization.characters,
          maxLength: 16,
          decoration: const InputDecoration(
            labelText: '學號',
            hintText: '例如 S001',
            counterText: '',
            border: border,
          ),
        ),
        const SizedBox(height: 9),
        TextField(
          controller: pinController,
          obscureText: true,
          keyboardType: TextInputType.number,
          maxLength: 8,
          onSubmitted: (_) => onSubmit(),
          decoration: const InputDecoration(
            labelText: 'PIN',
            counterText: '',
            border: border,
          ),
        ),
      ],
    );
  }
}
