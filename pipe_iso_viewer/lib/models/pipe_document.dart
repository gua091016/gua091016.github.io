import 'dart:math';

/// PDF에서 파싱된 전체 문서 데이터
class PipeDocument {
  final String lineNo;
  final String sketchNo;
  final String pipeSize;
  final List<PipePiece> pieces;
  final List<PipeFitting> fittings;
  final int weldPoints;
  final double totalCutMm;
  final double totalLengthMm;
  final String remark;
  final List<Pipe3DSegment> segments3d;

  const PipeDocument({
    required this.lineNo,
    required this.sketchNo,
    required this.pipeSize,
    required this.pieces,
    required this.fittings,
    required this.weldPoints,
    required this.totalCutMm,
    required this.totalLengthMm,
    required this.remark,
    required this.segments3d,
  });
}

/// 파이프 조각 (P1, P2, ...)
class PipePiece {
  final String id;
  final double cutLengthMm;
  final String size;

  const PipePiece({
    required this.id,
    required this.cutLengthMm,
    required this.size,
  });
}

/// 피팅 (엘보, 티 등)
class PipeFitting {
  final String type;
  final String size;
  final int quantity;

  const PipeFitting({
    required this.type,
    required this.size,
    required this.quantity,
  });
}

/// 2D PDF에서 추출한 원시 선분
class RawSegment {
  final double x1, y1, x2, y2, lw;

  const RawSegment({
    required this.x1,
    required this.y1,
    required this.x2,
    required this.y2,
    required this.lw,
  });

  double get length => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));

  double get angleDeg => atan2(y2 - y1, x2 - x1) * 180 / pi;

  IsoAxis? get isoAxis {
    final deg = ((angleDeg % 180) + 180) % 180;
    if ((deg - 90).abs() < 9) return IsoAxis.y;
    if ((deg - 30).abs() < 9) return IsoAxis.x;
    if ((deg - 150).abs() < 9) return IsoAxis.z;
    return null;
  }
}

enum IsoAxis { x, y, z }

/// 3D 공간의 파이프 선분
class Pipe3DSegment {
  final Vec3 start;
  final Vec3 end;
  final String? pieceId;

  const Pipe3DSegment({
    required this.start,
    required this.end,
    this.pieceId,
  });

  double get length {
    final dx = end.x - start.x;
    final dy = end.y - start.y;
    final dz = end.z - start.z;
    return sqrt(dx * dx + dy * dy + dz * dz);
  }

  Vec3 get midpoint => Vec3(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2,
    (start.z + end.z) / 2,
  );
}

class Vec3 {
  final double x, y, z;
  const Vec3(this.x, this.y, this.z);

  Vec3 operator +(Vec3 other) => Vec3(x + other.x, y + other.y, z + other.z);
  Vec3 operator -(Vec3 other) => Vec3(x - other.x, y - other.y, z - other.z);
  Vec3 operator *(double s) => Vec3(x * s, y * s, z * s);

  double get lengthSquared => x * x + y * y + z * z;
  double get length => sqrt(lengthSquared);

  Vec3 normalized() {
    final l = length;
    return l == 0 ? const Vec3(0, 0, 0) : Vec3(x / l, y / l, z / l);
  }

  Vec3 addScaled(Vec3 v, double s) => Vec3(x + v.x * s, y + v.y * s, z + v.z * s);

  @override
  String toString() => 'Vec3($x, $y, $z)';
}

/// 파싱 단계별 진단 정보
class ParseDiag {
  int streams = 0;
  int decomp = 0;
  int content = 0;
  int rawSegs = 0;
  int pipeSegs = 0;
}
