import 'dart:math';

import '../models/pipe_document.dart';

/// ISO 2D 선분 → 3D 파이프 세그먼트 변환
/// 역투영(isoInv) + BFS 멀티컴포넌트 방식
class Iso3DBuilder {
  static const double _eps = 4.0;
  static const double _targetUnitSize = 8.0;
  static const double _sq3 = 1.7320508075688772;

  static List<Pipe3DSegment> build(List<RawSegment> pipeSegs) {
    if (pipeSegs.isEmpty) return [];

    final avgLen = pipeSegs.map((s) => s.length).reduce((a, b) => a + b) / pipeSegs.length;
    final scale = _targetUnitSize / avgLen;

    // 노드 생성
    final nodes = <_Node>[];
    final edges = <_Edge>[];

    int findOrCreate(double x, double y) {
      for (var i = 0; i < nodes.length; i++) {
        if (_dist2d(nodes[i].x, nodes[i].y, x, y) < _eps) return i;
      }
      nodes.add(_Node(x, y));
      return nodes.length - 1;
    }

    for (final s in pipeSegs) {
      final a = findOrCreate(s.x1, s.y1);
      final b = findOrCreate(s.x2, s.y2);
      if (a != b) edges.add(_Edge(a, b, s.isoAxis!, s.length * scale));
    }

    if (nodes.isEmpty) return [];

    // 인접 리스트
    final adj = List.generate(nodes.length, (_) => <_AdjEntry>[]);
    for (var i = 0; i < edges.length; i++) {
      final e = edges[i];
      adj[e.a].add(_AdjEntry(e.b, i));
      adj[e.b].add(_AdjEntry(e.a, i));
    }

    // 역ISO 투영 (분리 컴포넌트 배치용)
    final rx = nodes[0].x, ry = nodes[0].y;
    Vec3 isoInv(double x, double y) {
      final dx = x - rx, dy = y - ry;
      return Vec3(
        (dx / _sq3 + dy) * scale,
        0,
        (dy - dx / _sq3) * scale,
      );
    }

    // 3D 방향벡터
    Vec3 dir3(IsoAxis axis, double dx, double dy) {
      switch (axis) {
        case IsoAxis.x: return Vec3(dx >= 0 ? 1 : -1, 0, 0);
        case IsoAxis.z: return Vec3(0, 0, dx >= 0 ? -1 : 1);
        case IsoAxis.y: return Vec3(0, dy >= 0 ? 1 : -1, 0);
      }
    }

    // 멀티컴포넌트 BFS
    final vis = List.filled(nodes.length, false);

    for (var start = 0; start < nodes.length; start++) {
      if (vis[start]) continue;

      nodes[start].pos = isoInv(nodes[start].x, nodes[start].y);
      vis[start] = true;
      final q = <int>[start];

      while (q.isNotEmpty) {
        final cur = q.removeAt(0);
        for (final entry in adj[cur]) {
          if (vis[entry.nb]) continue;
          vis[entry.nb] = true;
          final e = edges[entry.ei];
          final dx = nodes[entry.nb].x - nodes[cur].x;
          final dy = nodes[entry.nb].y - nodes[cur].y;
          final d = dir3(e.axis, dx, dy);
          nodes[entry.nb].pos = nodes[cur].pos!.addScaled(d, e.len);
          q.add(entry.nb);
        }
      }
    }

    // 중심 정렬
    var cx = 0.0, cy = 0.0, cz = 0.0;
    var cnt = 0;
    for (final n in nodes) {
      if (n.pos != null) { cx += n.pos!.x; cy += n.pos!.y; cz += n.pos!.z; cnt++; }
    }
    if (cnt > 0) {
      cx /= cnt; cy /= cnt; cz /= cnt;
      for (final n in nodes) {
        if (n.pos != null) n.pos = Vec3(n.pos!.x - cx, n.pos!.y - cy, n.pos!.z - cz);
      }
    }

    // 결과 생성
    final result = <Pipe3DSegment>[];
    for (final e in edges) {
      final pa = nodes[e.a].pos, pb = nodes[e.b].pos;
      if (pa != null && pb != null) {
        result.add(Pipe3DSegment(start: pa, end: pb));
      }
    }

    return result;
  }

  static double _dist2d(double x1, double y1, double x2, double y2) =>
      sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}

class _Node {
  final double x, y;
  Vec3? pos;
  _Node(this.x, this.y);
}

class _Edge {
  final int a, b;
  final IsoAxis axis;
  final double len;
  _Edge(this.a, this.b, this.axis, this.len);
}

class _AdjEntry {
  final int nb, ei;
  _AdjEntry(this.nb, this.ei);
}
