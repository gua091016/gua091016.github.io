import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

import '../models/pipe_document.dart';

/// PDF 바이너리 → RawSegment 목록 + 메타데이터 파싱
/// Python으로 검증된 로직을 Dart로 포팅
class PdfParserService {
  static const _stream = [115, 116, 114, 101, 97, 109]; // 'stream'
  static const _endstream = [101, 110, 100, 115, 116, 114, 101, 97, 109]; // 'endstream'

  static int _find(Uint8List arr, List<int> seq, int from) {
    outer:
    for (var i = from; i <= arr.length - seq.length; i++) {
      for (var j = 0; j < seq.length; j++) {
        if (arr[i + j] != seq[j]) continue outer;
      }
      return i;
    }
    return -1;
  }

  static Uint8List? _inflate(Uint8List data) {
    // zlib 형식 (PDF FlateDecode 기본)
    try {
      return Uint8List.fromList(zlib.decode(data));
    } catch (_) {}
    // raw deflate fallback (2바이트 zlib 헤더 제거)
    try {
      return Uint8List.fromList(zlib.decode(data.sublist(2)));
    } catch (_) {}
    return null;
  }

  static String _toText(Uint8List u8) => String.fromCharCodes(u8);

  /// PDF 파싱 메인 진입점
  static ({List<RawSegment> segs, ParseDiag diag}) parseBuffer(Uint8List bytes) {
    final diag = ParseDiag();
    final allSegs = <RawSegment>[];
    var pos = 0;

    while (true) {
      final si = _find(bytes, _stream, pos);
      if (si < 0) break;

      var ds = si + 6;
      if (bytes[ds] == 13) ds++; // \r
      if (bytes[ds] == 10) ds++; // \n

      final ei = _find(bytes, _endstream, ds);
      if (ei < 0) break;

      diag.streams++;
      pos = ei + 9;

      final raw = bytes.sublist(ds, ei);
      final decoded = _inflate(raw);
      if (decoded == null) continue;

      diag.decomp++;
      final text = _toText(decoded);

      if (!text.contains(' m ') && !text.contains('\nm') && !text.contains('\rm')) continue;
      diag.content++;

      final segs = _parseContentStream(text);
      diag.rawSegs += segs.length;
      allSegs.addAll(segs);
    }

    return (segs: allSegs, diag: diag);
  }

  /// PDF 콘텐츠 스트림 토큰 파서 (CTM 추적)
  static List<RawSegment> _parseContentStream(String text) {
    final tokens = text.split(RegExp(r'\s+'));
    final segs = <RawSegment>[];
    var ctm = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0];
    final stk = <List<double>>[];
    double cx = 0, cy = 0, sx = 0, sy = 0, lw = 0;
    final vals = <double>[];

    List<double> tp(double x, double y) => [
      ctm[0] * x + ctm[2] * y + ctm[4],
      ctm[1] * x + ctm[3] * y + ctm[5],
    ];

    void mul(double a, double b, double c, double d, double e, double f) {
      final a0 = ctm[0], b0 = ctm[1], c0 = ctm[2], d0 = ctm[3];
      final e0 = ctm[4], f0 = ctm[5];
      ctm = [
        a0 * a + c0 * b, b0 * a + d0 * b,
        a0 * c + c0 * d, b0 * c + d0 * d,
        a0 * e + c0 * f + e0, b0 * e + d0 * f + f0,
      ];
    }

    for (final t in tokens) {
      if (t.isEmpty) continue;
      final n = double.tryParse(t);
      if (n != null && n.isFinite) {
        vals.add(n);
        continue;
      }

      switch (t) {
        case 'q':
          stk.add(List.from(ctm));
          vals.clear();
        case 'Q':
          if (stk.isNotEmpty) ctm = stk.removeLast();
          vals.clear();
        case 'cm':
          if (vals.length >= 6) {
            final v = vals.length - 6;
            mul(vals[v], vals[v+1], vals[v+2], vals[v+3], vals[v+4], vals[v+5]);
          }
          vals.clear();
        case 'w':
          if (vals.isNotEmpty) lw = vals.last;
          vals.clear();
        case 'm':
          if (vals.length >= 2) {
            final p = tp(vals[vals.length - 2], vals.last);
            cx = p[0]; cy = p[1]; sx = cx; sy = cy;
          }
          vals.clear();
        case 'l':
          if (vals.length >= 2) {
            final p = tp(vals[vals.length - 2], vals.last);
            segs.add(RawSegment(x1: cx, y1: cy, x2: p[0], y2: p[1], lw: lw));
            cx = p[0]; cy = p[1];
          }
          vals.clear();
        case 'h':
          if ((cx - sx).abs() + (cy - sy).abs() > 0.1) {
            segs.add(RawSegment(x1: cx, y1: cy, x2: sx, y2: sy, lw: lw));
          }
          cx = sx; cy = sy;
          vals.clear();
        default:
          vals.clear();
      }
    }

    return segs;
  }

  /// ISO 파이프 선분만 필터 + 중복 제거
  static List<RawSegment> filterPipeSegs(List<RawSegment> raw) {
    if (raw.isEmpty) return [];

    final maxLw = raw.map((s) => s.lw).reduce(max);
    if (maxLw == 0) return [];
    final lwMin = maxLw * 0.45;
    const minLen = 6.0;

    final cls = <RawSegment>[];
    for (final s in raw) {
      if (s.lw < lwMin || s.length < minLen) continue;
      if (s.isoAxis == null) continue;
      cls.add(s);
    }

    // 중복 제거 (앱이 각 파이프를 lw 다르게 두 번 그림)
    final dd = <RawSegment>[];
    for (final s in cls) {
      bool dup = false;
      for (final d in dd) {
        if (_dist(d.x1, d.y1, s.x1, s.y1) < 2 &&
            _dist(d.x2, d.y2, s.x2, s.y2) < 2) {
          dup = true;
          break;
        }
      }
      if (!dup) dd.add(s);
    }

    return dd;
  }

  static double _dist(double x1, double y1, double x2, double y2) =>
      sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}
