import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../services/pdf_parser_service.dart';
import '../services/iso_3d_builder.dart';
import '../models/pipe_document.dart';
import '../theme/app_theme.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with SingleTickerProviderStateMixin {
  bool _loading = false;
  String _loadMsg = '';
  late AnimationController _pulseCtrl;
  late Animation<double> _pulse;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulse = Tween(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  Future<void> _openFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      withData: true,
    );
    if (result == null || result.files.isEmpty) return;
    final bytes = result.files.first.bytes;
    if (bytes == null) return;
    await _processBytes(bytes, result.files.first.name);
  }

  Future<void> _processBytes(Uint8List bytes, String filename) async {
    setState(() { _loading = true; _loadMsg = 'PDF 스트림 분석 중...'; });
    await Future.delayed(const Duration(milliseconds: 30));

    try {
      final parsed = PdfParserService.parseBuffer(bytes);
      setState(() => _loadMsg = '파이프 라인 인식 중...');
      await Future.delayed(const Duration(milliseconds: 30));

      final pipeSegs = PdfParserService.filterPipeSegs(parsed.segs);

      if (pipeSegs.isEmpty) {
        setState(() => _loading = false);
        _showError(_diagMessage(parsed.diag));
        return;
      }

      setState(() => _loadMsg = '3D 재구성 중...');
      await Future.delayed(const Duration(milliseconds: 30));

      final segs3d = Iso3DBuilder.build(pipeSegs);

      setState(() => _loading = false);

      if (!mounted) return;
      context.push('/viewer', extra: {
        'segs3d': segs3d,
        'filename': filename,
        'pipeCount': pipeSegs.length,
      });
    } catch (e) {
      setState(() => _loading = false);
      _showError('파싱 오류: $e');
    }
  }

  String _diagMessage(ParseDiag d) {
    if (d.streams == 0) return 'PDF 스트림을 찾지 못했습니다';
    if (d.decomp == 0) return '압축 해제 실패 (스트림 ${d.streams}개 발견)';
    if (d.content == 0) return '드로잉 데이터가 없습니다';
    if (d.rawSegs == 0) return '선분이 추출되지 않았습니다';
    return 'ISO 파이프 라인을 인식하지 못했습니다\n(선분 ${d.rawSegs}개 추출, Pipe ISO 앱 PDF인지 확인)';
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: AppTheme.error.withOpacity(0.9),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      duration: const Duration(seconds: 6),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          _buildBackground(),
          SafeArea(
            child: Column(
              children: [
                _buildHeader(),
                Expanded(child: _buildBody()),
              ],
            ),
          ),
          if (_loading) _buildLoadOverlay(),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    return Container(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment(0, -0.3),
          radius: 1.2,
          colors: [Color(0xFF0D1E3A), AppTheme.bg],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppTheme.border.withOpacity(0.4)),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF3A8EFF), Color(0xFF0044CC)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Center(
              child: Text('P', style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 15,
              )),
            ),
          ),
          const SizedBox(width: 10),
          const Text('Pipe ISO Viewer',
            style: TextStyle(
              color: AppTheme.textPrimary,
              fontSize: 17,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),
          ),
          const Spacer(),
          Text('v1.0', style: TextStyle(
            color: AppTheme.textDim,
            fontSize: 11,
          )),
        ],
      ),
    );
  }

  Widget _buildBody() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 메인 업로드 영역
            GestureDetector(
              onTap: _openFile,
              child: AnimatedBuilder(
                animation: _pulse,
                builder: (_, child) => Transform.scale(
                  scale: _pulse.value,
                  child: child,
                ),
                child: Container(
                  width: 160, height: 160,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const RadialGradient(
                      colors: [Color(0xFF1A3D7A), Color(0xFF091226)],
                    ),
                    border: Border.all(
                      color: AppTheme.primary.withOpacity(0.35),
                      width: 1.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primary.withOpacity(0.15),
                        blurRadius: 40,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.picture_as_pdf_rounded,
                        size: 52,
                        color: AppTheme.primary.withOpacity(0.9),
                      ),
                      const SizedBox(height: 10),
                      const Text('PDF 열기',
                        style: TextStyle(
                          color: AppTheme.textPrimary,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 36),

            // 안내 텍스트
            Text(
              'Pipe ISO 앱에서 PDF를 공유하거나\n파일을 직접 선택하세요',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 14,
                height: 1.7,
              ),
            ),

            const SizedBox(height: 48),

            // 기능 설명 칩들
            Wrap(
              spacing: 10,
              runSpacing: 10,
              alignment: WrapAlignment.center,
              children: const [
                _FeatureChip(icon: Icons.view_in_ar_rounded, label: '3D 파이프 시각화'),
                _FeatureChip(icon: Icons.touch_app_rounded, label: '탭으로 정보 확인'),
                _FeatureChip(icon: Icons.rotate_90_degrees_ccw_rounded, label: '자유 회전/줌'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadOverlay() {
    return Container(
      color: AppTheme.bg.withOpacity(0.88),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 48, height: 48,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                color: AppTheme.primary,
              ),
            ),
            const SizedBox(height: 20),
            Text(_loadMsg,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _FeatureChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1A30),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.borderDim),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: AppTheme.accent),
          const SizedBox(width: 7),
          Text(label, style: const TextStyle(
            color: AppTheme.textSecondary,
            fontSize: 12.5,
          )),
        ],
      ),
    );
  }
}
