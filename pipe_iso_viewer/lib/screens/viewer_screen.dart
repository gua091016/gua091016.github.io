import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:three_dart/three_dart.dart' as THREE;
import 'package:three_dart_jsm/three_dart_jsm.dart' as THREE_JSM;
import 'package:flutter_gl/flutter_gl.dart';

import '../models/pipe_document.dart';
import '../theme/app_theme.dart';

class ViewerScreen extends StatefulWidget {
  final List<Pipe3DSegment> segs3d;
  final String filename;
  final int pipeCount;

  const ViewerScreen({
    super.key,
    required this.segs3d,
    required this.filename,
    required this.pipeCount,
  });

  @override
  State<ViewerScreen> createState() => _ViewerScreenState();
}

class _ViewerScreenState extends State<ViewerScreen> {
  late FlutterGlPlugin _glPlugin;
  THREE.WebGLRenderer? _renderer;
  THREE.Scene? _scene;
  THREE.PerspectiveCamera? _camera;
  THREE_JSM.OrbitControls? _controls;

  Size _size = Size.zero;
  bool _glReady = false;
  bool _showPanel = true;
  Pipe3DSegment? _selected;

  // 재질
  late THREE.MeshStandardMaterial _pipeMat;
  late THREE.MeshStandardMaterial _jointMat;
  late THREE.MeshStandardMaterial _capMat;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  }

  @override
  void dispose() {
    _renderer?.dispose();
    _glPlugin.dispose();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual,
      overlays: SystemUiOverlay.values);
    super.dispose();
  }

  Future<void> _initGL(Size size) async {
    _size = size;
    _glPlugin = FlutterGlPlugin();
    final opts = {
      'antialias': true,
      'alpha': false,
      'width': size.width.toInt(),
      'height': size.height.toInt(),
      'dpr': MediaQuery.of(context).devicePixelRatio,
    };
    await _glPlugin.initialize(options: opts);
    await _glPlugin.prepareContext();
    _setupThree();
    setState(() => _glReady = true);
    _animate();
  }

  void _setupThree() {
    final size = _size;
    final dpr = MediaQuery.of(context).devicePixelRatio;

    _renderer = THREE.WebGLRenderer({
      'gl': _glPlugin.gl,
      'antialias': true,
    });
    _renderer!
      ..setPixelRatio(dpr)
      ..setSize(size.width, size.height, false)
      ..shadowMap.enabled = true
      ..shadowMap.type = THREE.PCFSoftShadowMap;

    _scene = THREE.Scene()
      ..background = THREE.Color(0x070B14);

    _camera = THREE.PerspectiveCamera(
      48,
      size.width / size.height,
      0.01,
      10000,
    );
    _camera!.position.set(40, 28, 60);

    _controls = THREE_JSM.OrbitControls(_camera!, _glPlugin.element)
      ..enableDamping = true
      ..dampingFactor = 0.07
      ..minDistance = 0.5
      ..maxDistance = 3000;

    _addLights();
    _addGrid();
    _buildPipes();
    _fitCamera();
  }

  void _addLights() {
    final s = _scene!;
    s.add(THREE.AmbientLight(THREE.Color(0x304060), 1.0));

    final key = THREE.DirectionalLight(THREE.Color(0xD8EEFF), 2.2);
    key.position.set(60, 90, 70);
    key.castShadow = true;
    key.shadow!.mapSize.width = 2048;
    key.shadow!.mapSize.height = 2048;
    s.add(key);

    final fill = THREE.DirectionalLight(THREE.Color(0x405080), 0.8);
    fill.position.set(-60, 20, -50);
    s.add(fill);

    final rim = THREE.DirectionalLight(THREE.Color(0x7090C0), 0.5);
    rim.position.set(0, -40, -80);
    s.add(rim);

    // 환경광 (포인트라이트로 PBR 느낌 강화)
    final env1 = THREE.PointLight(THREE.Color(0x3050A0), 1.5, 200);
    env1.position.set(-30, 40, 30);
    s.add(env1);
  }

  void _addGrid() {
    final grid = THREE.GridHelper(
      300, 50,
      THREE.Color(0x112235),
      THREE.Color(0x0A1525),
    );
    _scene!.add(grid);
  }

  // PBR 금속 재질
  THREE.MeshStandardMaterial _makeMat(int color,
      {double metalness = 0.82, double roughness = 0.18, double emissive = 0}) {
    return THREE.MeshStandardMaterial({
      'color': THREE.Color(color),
      'metalness': metalness,
      'roughness': roughness,
      if (emissive != 0) 'emissive': THREE.Color(color),
      if (emissive != 0) 'emissiveIntensity': emissive,
    });
  }

  void _buildPipes() {
    if (widget.segs3d.isEmpty) return;

    _pipeMat = _makeMat(0x8FA8BE, metalness: 0.85, roughness: 0.15);
    _jointMat = _makeMat(0x7A98AE, metalness: 0.9, roughness: 0.12);
    _capMat = _makeMat(0x6A8090, metalness: 0.75, roughness: 0.22);

    // 파이프 크기 기반 반지름
    final bbox = _calcBbox();
    final maxDim = [
      bbox.maxX - bbox.minX,
      bbox.maxY - bbox.minY,
      bbox.maxZ - bbox.minZ,
      1.0,
    ].reduce(max);
    final r = (maxDim * 0.022).clamp(0.35, 3.0);

    final upY = THREE.Vector3(0, 1, 0);
    final ptMap = <String, int>{};

    void addPt(Vec3 v) {
      final k = '${v.x.toStringAsFixed(2)},${v.y.toStringAsFixed(2)},${v.z.toStringAsFixed(2)}';
      ptMap[k] = (ptMap[k] ?? 0) + 1;
    }

    for (final seg in widget.segs3d) {
      final len = seg.length;
      if (len < 0.01) continue;

      final mid = seg.midpoint;
      final dir = (seg.end - seg.start).normalized();

      final geo = THREE.CylinderGeometry(r, r, len, 24, 1);
      final mesh = THREE.Mesh(geo, _pipeMat)
        ..position.set(mid.x, mid.y, mid.z)
        ..castShadow = true
        ..receiveShadow = true;

      final threeDir = THREE.Vector3(dir.x, dir.y, dir.z);
      mesh.quaternion.setFromUnitVectors(upY, threeDir);
      _scene!.add(mesh);

      addPt(seg.start);
      addPt(seg.end);
    }

    // 조인트 구체
    final sGeo = THREE.SphereGeometry(r * 1.06, 22, 16);
    for (final entry in ptMap.entries) {
      final coords = entry.key.split(',').map(double.parse).toList();
      final sp = THREE.Mesh(sGeo, _jointMat)
        ..position.set(coords[0], coords[1], coords[2])
        ..castShadow = true;
      _scene!.add(sp);
    }

    // 파이프 끝단 캡
    for (final entry in ptMap.entries) {
      if (entry.value != 1) continue;
      final coords = entry.key.split(',').map(double.parse).toList();
      final pos = Vec3(coords[0], coords[1], coords[2]);

      for (final seg in widget.segs3d) {
        final isStart = _near(pos, seg.start);
        final isEnd = _near(pos, seg.end);
        if (!isStart && !isEnd) continue;

        final away = isStart ? seg.end : seg.start;
        final d = (pos - away).normalized();
        final capGeo = THREE.CircleGeometry(r, 20);
        final cap = THREE.Mesh(capGeo, _capMat)
          ..position.set(
            pos.x + d.x * 0.01,
            pos.y + d.y * 0.01,
            pos.z + d.z * 0.01,
          )
          ..castShadow = true;
        final threeD = THREE.Vector3(d.x, d.y, d.z);
        cap.quaternion.setFromUnitVectors(THREE.Vector3(0, 0, 1), threeD);
        _scene!.add(cap);
        break;
      }
    }
  }

  bool _near(Vec3 a, Vec3 b) => (a - b).length < 0.1;

  _BBox _calcBbox() {
    double minX = double.infinity, maxX = double.negativeInfinity;
    double minY = double.infinity, maxY = double.negativeInfinity;
    double minZ = double.infinity, maxZ = double.negativeInfinity;
    for (final s in widget.segs3d) {
      for (final v in [s.start, s.end]) {
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
        if (v.z < minZ) minZ = v.z;
        if (v.z > maxZ) maxZ = v.z;
      }
    }
    return _BBox(minX, maxX, minY, maxY, minZ, maxZ);
  }

  void _fitCamera() {
    final bb = _calcBbox();
    final cx = (bb.minX + bb.maxX) / 2;
    final cy = (bb.minY + bb.maxY) / 2;
    final cz = (bb.minZ + bb.maxZ) / 2;
    final ms = [
      bb.maxX - bb.minX,
      bb.maxY - bb.minY,
      bb.maxZ - bb.minZ,
    ].reduce(max);

    final fov = (_camera!.fov as num).toDouble() * pi / 180;
    final dist = (ms / 2 / tan(fov / 2)) * 1.8;

    _controls!.target.set(cx, cy, cz);
    _camera!.position.set(cx + dist * 0.65, cy + dist * 0.42, cz + dist * 0.82);
    _camera!.near = dist * 0.001;
    _camera!.far = dist * 12;
    _camera!.updateProjectionMatrix();
    _controls!.update();
  }

  void _animate() {
    if (!mounted) return;
    _controls?.update();
    _renderer?.render(_scene!, _camera!);
    _glPlugin.updateTexture(_glPlugin.defaultFramebuffer);
    Future.delayed(const Duration(milliseconds: 16), _animate);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: LayoutBuilder(
        builder: (_, constraints) {
          final size = constraints.biggest;
          if (!_glReady && size != Size.zero) {
            WidgetsBinding.instance.addPostFrameCallback((_) => _initGL(size));
          }
          return Stack(
            children: [
              if (_glReady)
                Positioned.fill(
                  child: Texture(textureId: _glPlugin.textureId!),
                ),

              // 헤더
              SafeArea(
                child: _buildHeader(),
              ),

              // 하단 정보 패널
              if (_showPanel)
                Positioned(
                  bottom: 0, left: 0, right: 0,
                  child: SafeArea(child: _buildInfoPanel()),
                ),

              // 로딩
              if (!_glReady)
                Container(
                  color: AppTheme.bg,
                  child: const Center(
                    child: CircularProgressIndicator(color: AppTheme.primary),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          // 뒤로가기
          _GlassButton(
            icon: Icons.arrow_back_ios_new_rounded,
            onTap: () => Navigator.of(context).pop(),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(widget.filename,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text('파이프 ${widget.pipeCount}개',
                  style: const TextStyle(
                    color: AppTheme.textDim,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          // 카메라 리셋
          _GlassButton(
            icon: Icons.center_focus_strong_rounded,
            onTap: _fitCamera,
          ),
          const SizedBox(width: 8),
          // 패널 토글
          _GlassButton(
            icon: _showPanel
                ? Icons.keyboard_arrow_down_rounded
                : Icons.keyboard_arrow_up_rounded,
            onTap: () => setState(() => _showPanel = !_showPanel),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoPanel() {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface.withOpacity(0.92),
        borderRadius: BorderRadius.circular(AppDimens.radiusLg),
        border: Border.all(color: AppTheme.border.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 20,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              _InfoChip(label: '파이프', value: '${widget.pipeCount}개'),
              const SizedBox(width: 10),
              _InfoChip(label: '세그먼트', value: '${widget.segs3d.length}개'),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            '드래그: 회전  ·  핀치: 줌  ·  두 손가락: 이동',
            style: TextStyle(color: AppTheme.textDim, fontSize: 11),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _GlassButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _GlassButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38, height: 38,
        decoration: BoxDecoration(
          color: const Color(0xFF0D1526).withOpacity(0.85),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.border.withOpacity(0.5)),
        ),
        child: Icon(icon, color: AppTheme.textSecondary, size: 18),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label, value;
  const _InfoChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0A1428),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.borderDim),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(value, style: const TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          )),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(
            color: AppTheme.textDim,
            fontSize: 10,
          )),
        ],
      ),
    );
  }
}

class _BBox {
  final double minX, maxX, minY, maxY, minZ, maxZ;
  _BBox(this.minX, this.maxX, this.minY, this.maxY, this.minZ, this.maxZ);
}

// AppDimens 중복 정의 방지용 (theme에서 import)
class AppDimens {
  static const double radiusLg = 18;
}
