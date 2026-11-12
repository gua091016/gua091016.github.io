# 새들 템플릿 공유용 이미지 생성: og.png(1200x630, 링크 미리보기) / pin.png(1000x1500, 핀터레스트)
# 실행: py -I pipe-saddle-template/_build/og_image.py  (저장소 루트에서)
import math, os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), '..')
BG, INK, ACC, MUTED, GRID = '#0f1b2d', '#ffffff', '#32c2ee', '#9fb3c8', '#24364f'
FONT = 'C:/Windows/Fonts/arialbd.ttf'
FONT_R = 'C:/Windows/Fonts/arial.ttf'


def f(size, bold=True):
    return ImageFont.truetype(FONT if bold else FONT_R, size)


def saddle_points(r_br, r_run, n=360):
    # 가지관 원주를 펼친 좌표(x=원주 길이, y=호른 끝선에서 내려간 깊이)
    pts = []
    for i in range(n + 1):
        th = 2 * math.pi * i / n
        x = r_br * th
        y = r_run - math.sqrt(max(r_run ** 2 - (r_br * math.sin(th)) ** 2, 0))
        pts.append((x, y))
    return pts


def draw_template(d, box, r_br=57.15, r_run=84.15):
    # 4" on 6" (OD 114.3 / 168.3) 펼친 템플릿
    x0, y0, x1, y1 = box
    pts = saddle_points(r_br, r_run)
    w = 2 * math.pi * r_br
    depth = max(p[1] for p in pts)
    sx = (x1 - x0) / w
    sy = sx  # 1:1 비율 유지
    top = y0 + (y1 - y0) * 0.30
    # 종이 영역
    d.rectangle([x0, y0, x1, y1], fill='#f4f1e8')
    for k in range(17):
        gx = x0 + (x1 - x0) * k / 16
        d.line([gx, y0, gx, y1], fill='#d9d2bf', width=1)
    curve = [(x0 + p[0] * sx, top + p[1] * sy) for p in pts]
    d.polygon(curve + [(x1, y1), (x0, y1)], fill='#e3dccb')
    d.line(curve, fill='#d0342c', width=5)
    for k in (0, 4, 8, 12, 16):
        gx = x0 + (x1 - x0) * k / 16
        d.line([gx, y0, gx, top + depth * sy + 30], fill='#1f2a3a', width=2)
    label = 'CUT ALONG RED LINE  -  WRAP AROUND BRANCH'
    tb = d.textbbox((x0 + 10, y0 + 8), label, font=f(20))
    d.rectangle([tb[0] - 6, tb[1] - 4, tb[2] + 6, tb[3] + 4], fill='#f4f1e8')
    d.text((x0 + 10, y0 + 8), label, font=f(20), fill='#1f2a3a')


def og():
    im = Image.new('RGB', (1200, 630), BG)
    d = ImageDraw.Draw(im)
    d.text((60, 50), 'Free Pipe Saddle Template', font=f(58), fill=INK)
    d.text((60, 125), 'Fishmouth cut  |  Print  >  Wrap  >  Cut', font=f(32, False), fill=ACC)
    draw_template(d, (60, 200, 1140, 520))
    d.text((60, 545), 'Any size NPS 1/2" - 24"  |  mm / inch  |  Full-size PDF  |  No sign-up', font=f(26, False), fill=MUTED)
    d.text((60, 585), 'gua091016.github.io/pipe-saddle-template', font=f(24), fill=INK)
    im.save(os.path.join(OUT, 'og.png'), optimize=True)


def pin():
    im = Image.new('RGB', (1000, 1500), BG)
    d = ImageDraw.Draw(im)
    d.text((60, 70), 'FREE', font=f(64), fill=ACC)
    d.text((60, 150), 'Pipe Saddle', font=f(96), fill=INK)
    d.text((60, 260), 'Template', font=f(96), fill=INK)
    d.text((60, 390), 'Printable fishmouth wrap-around PDF', font=f(36, False), fill=MUTED)
    draw_template(d, (60, 470, 940, 900))
    steps = ['1. Pick header + branch size', '2. Download full-size PDF', '3. Wrap on the pipe and trace', '4. Cut along the red line']
    for i, s in enumerate(steps):
        d.text((60, 960 + i * 70), s, font=f(42), fill=INK)
    d.text((60, 1290), 'NPS 1/2" to 24"  |  mm or inch  |  No sign-up', font=f(32, False), fill=MUTED)
    d.text((60, 1380), 'gua091016.github.io/pipe-saddle-template', font=f(34), fill=ACC)
    im.save(os.path.join(OUT, 'pin.png'), optimize=True)


og()
pin()
print('ok')
