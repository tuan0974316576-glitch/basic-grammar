import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
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
    final success = await widget.controller.login(
      studentId: _studentIdController.text,
      pin: _pinController.text,
    );
    if (!mounted) return;
    unawaited(AppSfx.instance.play(success ? SfxCue.correct : SfxCue.wrong));
    if (!success) {
      _pinController.clear();
      _pinFocusNode.requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.background,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 12),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 560),
              child: Column(
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
                  const SizedBox(height: 10),
                  _LoginFields(
                    studentIdController: _studentIdController,
                    pinController: _pinController,
                    studentIdFocusNode: _studentIdFocusNode,
                    pinFocusNode: _pinFocusNode,
                    onSubmit: _login,
                  ),
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
    const border = OutlineInputBorder(
      borderRadius: BorderRadius.all(Radius.circular(12)),
      borderSide: BorderSide(color: AppPalette.border, width: 2),
    );
    return Column(
      children: [
        TextField(
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
            labelText: '學號',
            hintText: '例如 S001',
            border: border,
          ),
        ),
        const SizedBox(height: 9),
        TextField(
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
            labelText: 'PIN',
            border: border,
          ),
        ),
      ],
    );
  }
}
