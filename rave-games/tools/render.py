# a tiny PNG writer and a sprite renderer: rows of characters + palette -> scaled PNG
import zlib, struct, sys, json
def png(path, w, h, rgb):  # rgb: list of rows of (r,g,b)
    raw = b''.join(b'\x00' + bytes(sum(([r,g,b] for (r,g,b) in row), [])) for row in rgb)
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    open(path,'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))
def hexrgb(h): h=h.lstrip('#'); return (int(h[0:2],16), int(h[2:4],16), int(h[4:6],16))
def render(path, sprites, scale=8, bg='#303040', gap=4):
    # sprites: list of (rows, palette)
    W = sum(max(len(r) for r in rows) for rows,_ in sprites) * scale + gap * (len(sprites) + 1)
    H = max(len(rows) for rows,_ in sprites) * scale + gap * 2
    bgc = hexrgb(bg); img = [[bgc] * W for _ in range(H)]
    x0 = gap
    for rows, pal in sprites:
        w = max(len(r) for r in rows)
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch == '.': continue
                c = hexrgb(pal.get(ch, '#ff00ff'))
                for dy in range(scale):
                    for dx in range(scale): img[gap + y*scale + dy][x0 + x*scale + dx] = c
        x0 += w * scale + gap
    png(path, W, H, img)
if __name__ == '__main__':
    spec = json.load(open(sys.argv[1]))
    render(sys.argv[2], [(s['rows'], s['pal']) for s in spec], int(sys.argv[3]) if len(sys.argv) > 3 else 8)
