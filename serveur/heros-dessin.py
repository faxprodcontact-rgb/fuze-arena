# Générateur des héros dessinés à la main (segments : rangée -> [(colonne de départ, pixels)])
import json, sys

def rows(d):
    out = []
    for r, segs in d.items():
        for off, s in segs:
            out.append([r, off, s])
    return out

def band(r0, r1, off, s):
    return {r: [(off, s)] for r in range(r0, r1 + 1)}

def merge(*ds):
    out = {}
    for d in ds:
        for r, segs in d.items():
            out.setdefault(r, []).extend(segs)
    return out

ART = {}

# ============================== GUERRIER ==============================
torso = {}
for r in range(23, 36):
    segs = [(14, "QqaaaaaaaaAAaq")]
    segs.append((17, "5yyyyyy5"))
    if r in (23, 24): segs.append((18, "Yyyyyy"))
    if r == 28: segs.append((20, "44"))
    if r == 29: segs.append((19, "4554"))
    if r == 30: segs.append((20, "44"))
    if r >= 33: segs.append((14, "QQ"))
    if 24 <= r <= 29: segs.append((26, "A"))
    if r == 31: segs.append((14, "qq")); segs.append((25, "qqq"))
    torso[r] = segs
backarm = merge(band(25, 33, 10, "xvvx"), {34: [(10, "0332")], 35: [(10, "0332")], 36: [(11, "00")]})
ART['guerrier'] = {
  'behindUpper': [],
  'behindLower': [],
  'upper': rows(merge(backarm, {
    1: [(19, "RRrr")], 2: [(16, "rrRRRrr")], 3: [(14, "JrrrRRrrr")], 4: [(12, "JJrrrrrrrr")],
    5: [(10, "JJ"), (15, "nmmmMMMMmmn")], 6: [(9, "J"), (13, "nmmmmMMMMMmmmn")], 7: [(12, "nmmmmmMMMMMmmmmn")],
    8: [(11, "nmmmmmmmMMMmmmmmn")], 9: [(11, "nnmmmmmmmmmmmmmmmn")], 10: [(11, "nnmmmmmmmmmmmmmmmmn")],
    11: [(11, "Xnnmmm1mmm1mmm1mmmn")], 12: [(11, "XnnnnnnnnnnnnnnnnnX")],
    13: [(12, "Xnmmmmmnn"), (21, "zsss32ss")], 14: [(12, "Xnmmmmmnn"), (21, "zsss32ss")],
    15: [(12, "Xnmmmmmnn"), (21, "zsew32se")], 16: [(12, "Xnmmmmmnn"), (21, "zsee32se")],
    17: [(12, "Xnmmmmmnn"), (21, "zssss2sss")], 18: [(12, "Xnmmmmnn"), (20, "zzssssssz")],
    19: [(13, "Xnnnnn"), (19, "zzsssuuss")], 20: [(14, "XXnn"), (18, "zzzsssssz")],
    21: [(16, "0003333000")], 22: [(15, "03322223330")],
  }, torso, {
    23: [(10, "nmmmn")], 24: [(9, "nmmMmmn")], 25: [(9, "nmmmmmn")], 26: [(10, "Xnnnn")],
    36: [(14, "98888855888889")], 37: [(14, "99999999999999"), (13, "787")], 38: [(17, "tyyyyyyt"), (13, "898")],
  })),
  'lower': rows({
    39: [(15, "NNNN"), (22, "gggG"), (17, "tyyyyyyt")], 40: [(15, "NNNN"), (22, "gggGg"), (18, "tyyyyt")],
    41: [(15, "NNNN"), (22, "gggGg")], 42: [(14, "03320"), (22, "02211")], 43: [(14, "03330"), (22, "02221")],
    44: [(15, "NNNN"), (22, "gggGg")], 45: [(15, "NNNN"), (22, "gggGg")], 46: [(15, "NNNN"), (22, "gggGg")],
    47: [(14, "KoooOK"), (22, "KooOOoK")], 48: [(14, "KoooK"), (22, "KooooOK")], 49: [(14, "KoooK"), (22, "KoooooOo")],
    50: [(13, "KKooooK"), (22, "KoooooooO")], 51: [(13, "KKKKKKK"), (22, "KKKKKKKKKK")],
  }),
  'armIdle': rows({
    27: [(26, "xvvV")], 28: [(26, "xvvV")], 29: [(27, "xvvV")], 30: [(27, "xvvV")], 31: [(28, "xvvVv")], 32: [(28, "xvvVv")],
    33: [(29, "03221")], 34: [(29, "032211")], 35: [(29, "032211")], 36: [(29, "03321")], 37: [(30, "000")],
  }),
  'armAtk': rows({
    25: [(25, "xvvvV"), (29, "0322")], 26: [(25, "xvvvvV"), (28, "032211")], 27: [(26, "xxvvV"), (28, "032211")],
    28: [(28, "03321")], 29: [(29, "000")],
  }),
  'over': rows({
    23: [(25, "nmMMMmn")], 24: [(24, "nmMMMMMmn")], 25: [(24, "nmmMMMmmn")], 26: [(24, "nmmmmmmmn")], 27: [(25, "Xnnnnnn")],
  }),
}

# ============================== MAGE ==============================
robe_up = {}
for r in range(20, 39):
    segs = [(13, "QqqaaaaaaaaaAAq")]
    if r >= 30: segs.append((20, "yY"))
    robe_up[r] = segs
beard = {20: [(17, "WWWWiWWWWW")], 21: [(17, "WWWWiWWWW")], 22: [(18, "WWWiWWWW")], 23: [(18, "WWWiWWW")], 24: [(19, "WWiWWW")],
         25: [(19, "WWiWW")], 26: [(20, "WiWW")], 27: [(20, "WiW")], 28: [(21, "iW")], 29: [(21, "W")]}
robe_low = {}
for r in range(39, 51):
    k = (r - 39) // 3
    left, right = 12 - k, 28 + k
    w = right - left + 1
    s = "Qqq" + "a" * (w - 6) + "AAq"
    segs = [(left, s), (20, "yY")]
    if r >= 49: segs = [(left, "t" + "y" * (w - 2) + "t")]
    robe_low[r] = segs
robe_low[44].append((14, "4")); robe_low[46].append((26, "w")); robe_low[47].append((17, "4")); robe_low[42].append((24, "4"))
robe_low[51] = [(13, "KKoo"), (24, "KooooO")]
ART['mage'] = {
  'behindUpper': [], 'behindLower': [],
  'upper': rows(merge({
    0: [(7, "nn")], 1: [(7, "nmmn")], 2: [(8, "nmmmn")], 3: [(9, "nmmMmn")], 4: [(10, "nmmmMmn")], 5: [(11, "nmmmmMmn")],
    6: [(12, "nmmmmMMmn")], 7: [(13, "nmmmmmMMmmn")], 8: [(13, "JrrrrRRrrrrJ")],
    9: [(8, "nmmmmmmmmmmmmmmmmmmmmn")], 10: [(8, "XnnnnnnnnnnnnnnnnnnnnX")],
    11: [(13, "jhhhh"), (18, "zsssssss")], 12: [(12, "jhhhhh"), (18, "zssshhhs")],
    13: [(12, "jhhhhh"), (18, "zsssewsse")], 14: [(12, "jhhhhh"), (18, "zssseesse"), (27, "s")],
    15: [(12, "jhhhhh"), (18, "zzsssssssS")], 16: [(12, "jhhhh"), (18, "zsiWWWWWz")],
    17: [(12, "jhhh"), (17, "hWWWWWWWWW")], 18: [(12, "jhh"), (16, "hWWWWiWWWWW")], 19: [(13, "jh"), (16, "WWWWWiWWWW")],
  }, band(22, 30, 9, "xvvx"), {31: [(9, "tyyt")], 32: [(9, "tyyt")], 33: [(10, "zz")], 34: [(10, "zz")]}, robe_up,
     {20: [(14, "tyyyyyyyyyyyt")], 33: [(13, "tyyyyy55yyyyyyt")], 26: [(15, "4")], 31: [(25, "w")]}, beard)),
  'lower': rows(robe_low),
  'armIdle': rows({
    27: [(25, "xvvV")], 28: [(25, "xvvvV")], 29: [(26, "xvvvV")], 30: [(26, "xvvvVV")], 31: [(27, "xvvvvV")],
    32: [(27, "tyyyyY")], 33: [(29, "zss")], 34: [(29, "zsss")], 35: [(30, "zss")],
  }),
  'armAtk': rows({
    24: [(24, "xvvvV")], 25: [(24, "xvvvvV")], 26: [(25, "xvvvvV"), (29, "sS")], 27: [(26, "tyyyY"), (29, "zss")],
    28: [(29, "zss")], 29: [(30, "zs")],
  }),
  'over': [],
  'noStride': True,
}

# ============================== ARCHER ==============================
tunic = {}
for r in range(22, 38):
    segs = [(13, "QqqaaaaaaaaAAaq")]
    d = r - 22
    if d <= 12: segs.append((14 + d, "87"))
    tunic[r] = segs
ART['archer'] = {
  'behindUpper': rows(merge({2: [(6, "f"), (9, "F")], 3: [(6, "fF"), (9, "Ff")], 4: [(7, "7"), (9, "7")], 5: [(7, "7"), (9, "7")]},
                            band(6, 30, 6, "98877"), {6: [(6, "77777")], 18: [(6, "55555")]})),
  'behindLower': [],
  'upper': rows(merge(band(23, 32, 9, "xvvx"), {33: [(9, "8778")], 34: [(9, "8778")], 35: [(10, "99")]}, tunic, {
    3: [(15, "nmmmmmn")], 4: [(13, "nmmmmMMmmn")], 5: [(12, "nmmmmmMMMmmn")], 6: [(11, "nmmmmmmmMMmmmn")],
    7: [(11, "nmmmmmmmmmmmmmn")], 8: [(10, "nmmmmmmmmmmmmmmmn")], 9: [(10, "nmmmmmnnnnnnnnnmmn")],
    10: [(10, "nmmmmn"), (16, "Xjhhhhhhj"), (25, "mmn")], 11: [(10, "nmmmmn"), (16, "jzssssssss"), (26, "n")],
    12: [(10, "nmmmmn"), (16, "jzssssssss"), (26, "n")], 13: [(10, "nmmmmn"), (16, "jzsssewsse"), (26, "n")],
    14: [(10, "nmmmmn"), (16, "jzssseessesS")], 15: [(10, "nmmmmn"), (16, "jzzssssssss")],
    16: [(10, "nmmmmmn"), (17, "zzsssuuss")], 17: [(11, "nmmmmmn"), (18, "zzsssss")], 18: [(12, "nmmmmmmn"), (19, "zzzz")],
    19: [(12, "nmmmmmmmmmmmn")], 20: [(11, "nmmmmmmmmmmmmmn")], 21: [(11, "nmmmmmmlmmmmmmn"), (18, "lL")],
    35: [(13, "988888558888889")], 36: [(13, "999999999999999")], 37: [(12, "Qqqaaaaaaaaaaaqq")], 38: [(12, "qqqqqqqqqqqqqqqq")],
    34: [(25, "2"), (26, "8")],
  })),
  'lower': rows({
    39: [(14, "NNNNN"), (22, "ggggG")], 40: [(14, "NNNNN"), (22, "ggggG")], 41: [(15, "NNNN"), (22, "gggGg")],
    42: [(15, "NNNN"), (22, "gggGg")], 43: [(15, "NNNN"), (22, "gggGg")], 44: [(15, "NNNN"), (22, "gggGg")],
    45: [(14, "KoooOK"), (22, "KooOOoK")], 46: [(14, "KoOooK"), (22, "KoOooOK")], 47: [(14, "KoooK"), (22, "KooooOK")],
    48: [(14, "KoooK"), (22, "KoooooOo")], 49: [(14, "KoooK"), (22, "KoooooOo")], 50: [(13, "KKooooK"), (22, "KoooooooO")],
    51: [(13, "KKKKKKK"), (22, "KKKKKKKKKK")],
  }),
  'armIdle': rows({
    27: [(25, "xvvV")], 28: [(25, "xvvV")], 29: [(26, "xvvV")], 30: [(26, "x887")], 31: [(27, "x8877")], 32: [(28, "x887")],
    33: [(29, "98877")], 34: [(29, "98877")], 35: [(29, "9887")], 36: [(30, "99")],
  }),
  'armAtk': rows({
    24: [(24, "xvvvV")], 25: [(24, "xvvvvV")], 26: [(25, "x8877")], 27: [(27, "988777")], 28: [(28, "98877")], 29: [(28, "9887")], 30: [(29, "99")],
  }),
  'over': [],
}

# ============================== PALADIN ==============================
cape = {}
for r in range(22, 49):
    k = (r - 22)
    left = 13 - k // 3
    w = 4 + k // 3
    cape[r] = [(left, "k" + "c" * (w - 1))]
cape[48] = [(13 - 26 // 3, "5" * (4 + 26 // 3))]
pal_torso = {}
for r in range(22, 37):
    segs = [(14, "QqaaaaaaaaaAAq")]
    if 25 <= r <= 34: segs.append((20, "54"))
    if r in (28, 29): segs.append((17, "55545555"))
    if r == 28: segs.append((20, "pP"))
    pal_torso[r] = segs
ART['paladin'] = {
  'behindUpper': [], 'behindLower': rows(cape),
  'upper': rows(merge(band(25, 33, 10, "xvVx"), {34: [(10, "0322")], 35: [(10, "0322")], 36: [(11, "00")]}, {
    5: [(15, "jhhhhhhj")], 6: [(13, "jhhhHHHhhhj")], 7: [(12, "jhhhhHHHhhhhj")], 8: [(11, "jhhhhhhhHhhhhhj")],
    9: [(11, "jhhhhhhhhhhhhhhj")], 10: [(11, "jhh"), (14, "555555p55555"), (26, "hj")],
    11: [(11, "jhhhhhh"), (18, "zsssssss"), (26, "hj")], 12: [(11, "jhhhhhh"), (18, "zsssjjjs"), (26, "h")],
    13: [(11, "jhhhhhh"), (18, "zssssewsse")], 14: [(11, "jhhhhhh"), (18, "zsssseessS")],
    15: [(11, "jhhhhhh"), (18, "zzssssssss")], 16: [(11, "jhhhhh"), (17, "jzzsssuus")], 17: [(11, "jhhhhh"), (18, "zzsssss")],
    18: [(11, "jhhhhh"), (19, "zzzz")], 19: [(12, "jhhhh"), (18, "zzz")], 20: [(12, "jhhh"), (17, "zzzz")], 21: [(13, "jhh"), (16, "0333330")],
  }, pal_torso, {
    22: [(10, "03220")], 23: [(9, "0322220")], 24: [(9, "0333330")], 25: [(10, "00000")],
    35: [(14, "98888855888889")], 36: [(14, "99999999999999")], 37: [(15, "qaaaaaaaaaq")], 38: [(15, "tyyyyyyyyyt")],
  })),
  'lower': rows({
    39: [(15, "NgNg"), (22, "gGgGg")], 40: [(15, "gNgN"), (22, "GgGgG")], 41: [(15, "NgNg"), (22, "gGgGg")],
    42: [(14, "03320"), (22, "02211")], 43: [(14, "03330"), (22, "02221")], 44: [(15, "NgNg"), (22, "gGgGg")],
    45: [(15, "gNgN"), (22, "GgGgG")], 46: [(15, "NgNg"), (22, "gGgGg")],
    47: [(14, "KoooOK"), (22, "KooOOoK")], 48: [(14, "KoooK"), (22, "KooooOK")], 49: [(14, "KoooK"), (22, "KoooooOo")],
    50: [(13, "KKooooK"), (22, "KoooooooO")], 51: [(13, "KKKKKKK"), (22, "KKKKKKKKKK")],
  }),
  'armIdle': rows({
    27: [(26, "xvVv")], 28: [(26, "xVvV")], 29: [(27, "xvVv")], 30: [(27, "xVvV")], 31: [(28, "xvVvV")], 32: [(28, "xVvVv")],
    33: [(29, "03221")], 34: [(29, "032211")], 35: [(29, "032211")], 36: [(29, "03321")], 37: [(30, "000")],
  }),
  'armAtk': rows({
    25: [(25, "xvVvV"), (29, "0322")], 26: [(25, "xVvVvV"), (28, "032211")], 27: [(26, "xxvVv"), (28, "032211")],
    28: [(28, "03321")], 29: [(29, "000")],
  }),
  'over': rows({22: [(25, "02110")], 23: [(24, "0211110")], 24: [(24, "0222220")], 25: [(24, "0333330")], 26: [(25, "00000")]}),
}


# ============================== JAMBES EN MOUVEMENT ==============================
# Les jambes sont dessinées comme de vrais membres (cuisse + mollet + botte) pour la fente d'attaque et la course.
import math

def thick(px, a, b, w, ch):
    (x1, y1), (x2, y2) = a, b
    xs, ys = range(int(min(x1, x2) - w), int(max(x1, x2) + w) + 1), range(int(min(y1, y2) - w), int(max(y1, y2) + w) + 1)
    for y in ys:
        for x in xs:
            dx, dy = x2 - x1, y2 - y1
            L2 = dx * dx + dy * dy or 1
            t = max(0, min(1, ((x + .5 - x1) * dx + (y + .5 - y1) * dy) / L2))
            cx, cy = x1 + t * dx, y1 + t * dy
            if (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= (w / 2) ** 2:
                px[(x, y)] = ch

def leg(px, hip, knee, ankle, fill, light, guard=None, mail=None):
    seg = {}
    thick(seg, hip, knee, 4.6, fill)
    thick(seg, knee, ankle, 4.2, fill)
    # côté éclairé : le pixel le plus à droite de chaque rangée
    rowsx = {}
    for (x, y) in seg: rowsx.setdefault(y, []).append(x)
    for y, xs in rowsx.items(): seg[(max(xs), y)] = light
    if mail:
        for (x, y) in list(seg):
            if (x + y) % 2 == 0: seg[(x, y)] = mail
    if guard:
        kx, ky = int(round(knee[0])), int(round(knee[1]))
        for i, c in enumerate("0332"): seg[(kx - 2 + i, ky - 1)] = c
        for i, c in enumerate("0221"): seg[(kx - 2 + i, ky)] = c
    px.update(seg)

def boot(px, ankle, tilt=0):
    ax, ay = int(round(ankle[0])), int(round(ankle[1]))
    shape = ["KooOK", "KoooOK", "KKoooooO", "KKKKKKKK"]
    offs = [-2, -2, -3, -3]
    for i, (row, o) in enumerate(zip(shape, offs)):
        for j, c in enumerate(row):
            px[(ax + o + j + (tilt if i >= 2 else 0), ay + i - (tilt if i >= 2 else 0))] = c

def to_rows(px):
    out = {}
    for (x, y), c in sorted(px.items(), key=lambda k: (k[0][1], k[0][0])):
        if 0 <= x < 44 and 0 <= y < 56:
            out.setdefault(y, []).append((x, c))
    res = []
    for y, cells in out.items():
        for x, c in cells: res.append([y, x, c])
    return res

# hanches (le haut du corps est penché de +3 en attaque/course)
POSES = {
  # fente : jambe avant pliée, genou en avant ; jambe arrière tendue en diagonale
  'atk':  {'back': ((19.5, 39), (15, 44), (11, 48.5)), 'front': ((25.5, 39), (29.5, 43.5), (29, 47.5)), 'btilt': 1},
  # course, temps 1 : grande foulée
  'run1': {'back': ((19.5, 39), (16.5, 44.5), (13, 47.5)), 'front': ((25.5, 39), (29.5, 42.5), (30, 47)), 'btilt': 1},
  # course, temps 2 : les jambes se croisent, pied arrière levé
  'run2': {'back': ((20.5, 39), (19, 44), (16, 45.5)), 'front': ((24.5, 39), (25.5, 44), (24.5, 48.5)), 'btilt': 0},
}

def pose_lower(cls, pose):
    P = POSES[pose]
    px = {}
    guard = cls in ('guerrier', 'paladin')
    mail = 'G' if cls == 'paladin' else None
    bh, bk, ba = P['back']; fh, fk, fa = P['front']
    leg(px, bh, bk, ba, 'N', 'g', guard and False, mail and 'g')
    boot(px, ba, P['btilt'])
    leg(px, fh, fk, fa, 'g', 'G', guard, mail)
    boot(px, fa)
    rows_ = to_rows(px)
    # jupe du tabard / bas de la tunique, qui suit le buste penché (+3)
    skirt = {
      'guerrier': [[39, 20, "tyyyyyyt"], [40, 21, "tyyyyt"]],
      'archer': [], 'paladin': [],
    }[cls]
    return rows_ + skirt

def robe_pose(pose):
    # la robe s'incline vers l'arrière et flotte, les chaussures dépassent devant
    out = []
    skew = {'atk': 0.45, 'run1': 0.35, 'run2': 0.2}[pose]
    for r in range(39, 51):
        k = (r - 39) // 3
        left, right = 12 - k, 28 + k
        w = right - left + 1
        dx = 3 - int(round((r - 39) * skew))
        s = "Qqq" + "a" * (w - 6) + "AAq"
        if r >= 49: s = "t" + "y" * (w - 2) + "t"
        out.append([r, left + dx, s])
        if r < 49: out.append([r, 20 + dx, "yY"])
    feet = {'atk': [[51, 26, "KooooO"], [50, 9, "KKoo"]], 'run1': [[51, 25, "KooooO"], [50, 11, "KKoo"]], 'run2': [[51, 21, "KooooO"], [49, 14, "KKoo"]]}[pose]
    return out + feet

for cls in ('guerrier', 'archer', 'paladin'):
    for pose in POSES:
        ART[cls]['lower_' + pose] = pose_lower(cls, pose)
for pose in POSES:
    ART['mage']['lower_' + pose] = robe_pose(pose)

# vérifications : rien ne dépasse la grille 44 × 56
for cls, A in ART.items():
    for layer, segs in A.items():
        if not isinstance(segs, list): continue
        for r, off, s in segs:
            assert 0 <= r < 56 and off >= 0 and off + len(s) <= 44, (cls, layer, r, off, s)
print(json.dumps(ART, separators=(',', ':')))
