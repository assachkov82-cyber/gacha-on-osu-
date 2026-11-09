"""Генерирует SVG-значки игры в assets/icons/*.svg (стиль: розово-красный глянец, тёмный контур)."""
import os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(R,'assets','icons')
O='#2a0010'  # контур
def svg(defs,body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>{defs}</defs>{body}</svg>'
def lg(i,stops,x2=0,y2=1):
    s=''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o,c in stops)
    return f'<linearGradient id="{i}" x1="0" y1="0" x2="{x2}" y2="{y2}">{s}</linearGradient>'
def rg(i,stops,cx=.35,cy=.3):
    s=''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o,c in stops)
    return f'<radialGradient id="{i}" cx="{cx}" cy="{cy}" r=".8">{s}</radialGradient>'
SP='<path d="M52 6l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"/>'  # искорка
PINK=[(0,'#ffd1e6'),(.45,'#ff5fa2'),(1,'#c4135a')]
RED=[(0,'#ffb0bd'),(.45,'#ff1f3d'),(1,'#8a0018')]
GOLD=[(0,'#fff4c2'),(.45,'#ffcc33'),(1,'#d97a00')]
WHITE=[(0,'#ffffff'),(.6,'#ffe3ef'),(1,'#ff9cc6')]
I={}
I['gold']=svg(rg('g',GOLD)+lg('e',[(0,'#d97a00'),(1,'#8a4a00')]),
 f'<ellipse cx="32" cy="38" rx="25" ry="20" fill="url(#e)" stroke="{O}" stroke-width="3"/><ellipse cx="32" cy="32" rx="25" ry="20" fill="url(#g)" stroke="{O}" stroke-width="3"/><ellipse cx="32" cy="32" rx="17" ry="13" fill="none" stroke="#b86200" stroke-width="2.5"/><path d="M32 22l2.9 6 6.6.7-4.9 4.5 1.4 6.5-6-3.4-6 3.4 1.4-6.5-4.9-4.5 6.6-.7z" fill="#b86200"/><ellipse cx="23" cy="24" rx="7" ry="3" fill="#fff" opacity=".7" transform="rotate(-20 23 24)"/>'+SP)
I['energy']=svg(lg('g',[(0,'#ffffff'),(.4,'#ff9cc6'),(1,'#ff1f3d')]),
 f'<path d="M37 3L12 36h15l-5 25 28-36H34z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M33 9L19 31h9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>')
I['key']=svg(lg('g',PINK,1,1),
 f'<circle cx="21" cy="21" r="14" fill="url(#g)" stroke="{O}" stroke-width="3"/><circle cx="21" cy="21" r="5.5" fill="#2a0010"/><path d="M30 30l24 24-5 5-4-4-4 4-4-4 3-3-15-15z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M13 14a10 10 0 016-5" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>'+SP)
I['book']=svg(lg('g',RED,1,1)+lg('p',[(0,'#fff'),(1,'#ffd1e6')]),
 f'<path d="M12 8h36a4 4 0 014 4v44H16a6 6 0 01-6-6V12a4 4 0 012-4z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M16 46h36v10H16a5 5 0 010-10z" fill="url(#p)" stroke="{O}" stroke-width="3"/><path d="M33 16l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#fff" stroke="{O}" stroke-width="1.5"/><path d="M15 12v30" stroke="#ff9cc6" stroke-width="2.5"/>')
I['bp']=svg(lg('g',[(0,'#ff5fa2'),(1,'#ff1f3d')],1,1),
 f'<path d="M32 3l25 14v30L32 61 7 47V17z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M32 9l20 11v24L32 55 12 44V20z" fill="none" stroke="#fff" stroke-width="1.5" opacity=".6"/><text x="32" y="41" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="22" text-anchor="middle" fill="#fff" stroke="{O}" stroke-width="1.5" font-style="italic">BP</text>')
I['ess']=svg(rg('g',[(0,'#ffffff'),(.4,'#ffb3d1'),(1,'#ff1f8f')],.5,.5),
 f'<path d="M32 2l7 23 23 7-23 7-7 23-7-23-23-7 23-7z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M32 14l3 15 15 3-15 3-3 15-3-15-15-3 15-3z" fill="#fff" opacity=".85"/>')
I['ticket']=svg(lg('g',RED,1,0),
 f'<path d="M5 18h54v9a5 5 0 000 10v9H5v-9a5 5 0 000-10z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M43 20v24" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/><path d="M24 22l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z" fill="#fff" stroke="{O}" stroke-width="1.5"/>')
I['aim']=svg(lg('g',RED,1,1),
 f'<path d="M32 3l20 17-20 41L12 20z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M12 20h40M32 3l-8 17 8 41 8-41z" fill="none" stroke="{O}" stroke-width="1.8" opacity=".55"/><path d="M24 9l-7 10" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>'+SP)
I['heart']=svg(lg('g',WHITE,1,1),
 f'<path d="M32 57S6 41 6 22a13 13 0 0126-6 13 13 0 0126 6c0 19-26 35-26 35z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M14 20a7 7 0 017-6" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M22 32h7l3-6 4 12 3-6h6" fill="none" stroke="#ff1f3d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')
I['acc']=svg(lg('g',[(0,'#ffffff'),(.6,'#f0f0f0'),(1,'#b8b8c8')],1,1),
 f'<path d="M32 3l22 22-22 36L10 25z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="28" r="9" fill="none" stroke="#ff1f3d" stroke-width="3"/><path d="M32 15v8M32 33v8M19 28h8M37 28h8" stroke="#ff1f3d" stroke-width="3" stroke-linecap="round"/>')
I['spd']=svg(rg('g',[(0,'#ffffff'),(.5,'#ffb3d1'),(1,'#ff5fa2')]),
 f'<circle cx="32" cy="32" r="26" fill="url(#g)" stroke="{O}" stroke-width="3"/><path d="M32 14a18 18 0 1 1-17 12M32 22a10 10 0 1 1-9 7" fill="none" stroke="#c4135a" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="32" r="3.5" fill="#c4135a"/>'+SP)
I['chip']=svg(lg('g',PINK,1,1),
 f'<g stroke="{O}" stroke-width="3" stroke-linecap="round"><path d="M22 6v8M32 6v8M42 6v8M22 50v8M32 50v8M42 50v8M6 22h8M6 32h8M6 42h8M50 22h8M50 32h8M50 42h8"/></g><rect x="13" y="13" width="38" height="38" rx="6" fill="url(#g)" stroke="{O}" stroke-width="3"/><text x="32" y="40" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="20" text-anchor="middle" fill="#fff" stroke="{O}" stroke-width="1.2">HD</text>')
I['sword']=svg(lg('g',[(0,'#ffffff'),(1,'#ffb3d1')],1,1)+lg('h',RED),
 f'<g stroke="{O}" stroke-width="3" stroke-linejoin="round"><path d="M6 6l9-1 30 30-7 7L6 14z" fill="url(#g)"/><path d="M58 6l-9-1-30 30 7 7 30-30z" fill="url(#g)"/><path d="M12 42l10 10M52 42l-10 10" stroke-width="8"/><path d="M12 42l10 10M52 42l-10 10" stroke-width="4" stroke="#ff1f3d"/></g><g fill="url(#h)" stroke="{O}" stroke-width="3"><circle cx="11" cy="53" r="5"/><circle cx="53" cy="53" r="5"/></g>')
I['hp']=svg(lg('g',RED,1,1),
 f'<path d="M32 57S6 41 6 22a13 13 0 0126-6 13 13 0 0126 6c0 19-26 35-26 35z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M14 20a7 7 0 017-6" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>')
I['def']=svg(lg('g',[(0,'#ffffff'),(.5,'#ff9cc6'),(1,'#c4135a')],1,1),
 f'<path d="M32 4l24 8v16c0 16-11 27-24 32C19 55 8 44 8 28V12z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M32 12v40M14 28h36" stroke="{O}" stroke-width="2" opacity=".35"/><path d="M15 16l9-3" stroke="#fff" stroke-width="3" stroke-linecap="round"/>')
I['speed']=svg(lg('g',[(0,'#fff'),(1,'#ff5fa2')],1,0),
 f'<g stroke="{O}" stroke-width="3" stroke-linejoin="round"><path d="M22 12l24 20-24 20 6-20z" fill="url(#g)"/><path d="M38 12l20 20-20 20 5-20z" fill="url(#g)"/></g><path d="M4 24h12M2 32h14M4 40h12" stroke="#ff5fa2" stroke-width="4" stroke-linecap="round"/>')
I['skill']=svg(rg('g',[(0,'#ffffff'),(.5,'#ffb3d1'),(1,'#ff1f8f')],.5,.5),
 f'<path d="M26 6l5 15 15 5-15 5-5 15-5-15-15-5 15-5z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><path d="M48 34l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="url(#g)" stroke="{O}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="50" cy="12" r="4" fill="#fff" stroke="{O}" stroke-width="2"/>')
I['passive']=svg(lg('g',PINK,1,0),
 f'<path d="M20 4c0 16 24 16 24 28S20 44 20 60M44 4c0 16-24 16-24 28s24 12 24 28" fill="none" stroke="{O}" stroke-width="9" stroke-linecap="round"/><path d="M20 4c0 16 24 16 24 28S20 44 20 60M44 4c0 16-24 16-24 28s24 12 24 28" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/><path d="M24 14h16M24 50h16M27 24h10M27 40h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>')
I['gift']=svg(lg('g',RED,1,1)+lg('r',WHITE,1,0),
 f'<rect x="8" y="24" width="48" height="34" rx="4" fill="url(#g)" stroke="{O}" stroke-width="3"/><rect x="5" y="16" width="54" height="12" rx="3" fill="url(#g)" stroke="{O}" stroke-width="3"/><rect x="27" y="16" width="10" height="42" fill="url(#r)" stroke="{O}" stroke-width="2.5"/><path d="M32 16c-6-12-18-10-14-2 2 3 8 2 14 2 6 0 12 1 14-2 4-8-8-10-14 2z" fill="url(#r)" stroke="{O}" stroke-width="2.5" stroke-linejoin="round"/>')
I['tower']=svg(lg('g',RED,1,1),
 f'<path d="M24 60V22l-4-4V8h6v4h4V8h4v4h4V8h6v10l-4 4v38z" fill="url(#g)" stroke="{O}" stroke-width="3" stroke-linejoin="round"/><rect x="28" y="40" width="8" height="20" fill="{O}"/><rect x="29" y="26" width="6" height="8" rx="3" fill="#ffd1e6"/>'+SP)
os.makedirs(OUT,exist_ok=True)
for k,v in I.items(): open(os.path.join(OUT,k+'.svg'),'w').write(v)
print(len(I),'icons',sum(len(v) for v in I.values()),'bytes')
