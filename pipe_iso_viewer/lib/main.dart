import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';

import 'screens/home_screen.dart';
import 'screens/viewer_screen.dart';
import 'theme/app_theme.dart';
import 'models/pipe_document.dart';
import 'services/pdf_parser_service.dart';
import 'services/iso_3d_builder.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: PipeIsoViewerApp()));
}

class PipeIsoViewerApp extends ConsumerStatefulWidget {
  const PipeIsoViewerApp({super.key});

  @override
  ConsumerState<PipeIsoViewerApp> createState() => _AppState();
}

class _AppState extends ConsumerState<PipeIsoViewerApp> {
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _router = GoRouter(routes: [
      GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
      GoRoute(
        path: '/viewer',
        builder: (_, state) {
          final extra = state.extra as Map<String, dynamic>;
          return ViewerScreen(
            segs3d: extra['segs3d'] as List<Pipe3DSegment>,
            filename: extra['filename'] as String,
            pipeCount: extra['pipeCount'] as int,
          );
        },
      ),
    ]);
    _listenSharedFiles();
  }

  void _listenSharedFiles() {
    // 앱 실행 중 공유 수신
    ReceiveSharingIntent.instance.getMediaStream().listen(_handleSharedFiles);
    // 앱 종료 상태에서 공유로 열릴 때
    ReceiveSharingIntent.instance.getInitialMedia().then((files) {
      if (files.isNotEmpty) _handleSharedFiles(files);
    });
  }

  Future<void> _handleSharedFiles(List<SharedMediaFile> files) async {
    final pdfs = files.where((f) => f.path.toLowerCase().endsWith('.pdf'));
    if (pdfs.isEmpty) return;

    try {
      final bytes = await File(pdfs.first.path).readAsBytes();
      final parsed = PdfParserService.parseBuffer(bytes);
      final pipeSegs = PdfParserService.filterPipeSegs(parsed.segs);
      if (pipeSegs.isEmpty) return;

      final segs3d = Iso3DBuilder.build(pipeSegs);
      final filename = pdfs.first.path.split('/').last;

      _router.push('/viewer', extra: {
        'segs3d': segs3d,
        'filename': filename,
        'pipeCount': pipeSegs.length,
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Pipe ISO Viewer',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      routerConfig: _router,
    );
  }
}
