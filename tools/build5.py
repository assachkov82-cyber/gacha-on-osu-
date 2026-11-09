import re,glob,json,sys,html
from collections import defaultdict,Counter
d=sys.argv[1]+'/'
MC=dict(osu='o',taiko='t',fruits='c',mania='m')
rows={}
def parse(f,mode):
    h=open(f,encoding='utf-8',errors='ignore').read()
    for tr in h.split('ranking-page-table__row')[1:]:
        m=re.search(r'data-user-id="(\d+)"',tr)
        if not m: continue
        uid=int(m.group(1))
        if uid in rows: continue
        nm=re.search(r'u-ellipsis-overflow"[^>]*>\s*(.*?)\s*</span>',tr,re.S)
        if not nm: continue
        name=html.unescape(nm.group(1)).replace('\t',' ').replace('\n',' ').replace('\\','').replace('`',"'").replace('${','$ {').replace('\x01','')
        cc=re.search(r'country=([A-Z]{2})',tr);cc=cc.group(1) if cc else 'XX'
        tds=re.findall(r'<td[^>]*>\s*([^<]*?)\s*</td>',tr)
        try: pp=int(tds[-4].replace(',',''))
        except: continue
        rows[uid]=[name,uid,cc,pp,MC[mode]]
for f in sorted(glob.glob(d+'rk/*.html')): parse(f,f.split('/')[-1].split('_')[0])
for f in sorted(glob.glob(d+'ck/*.html')): parse(f,f.split('/')[-1].split('_')[0])
top=[l.strip().split('|') for l in open(d+'top.txt')]
cuts=[(6,"EX"),(16,"SS"),(30,"S"),(50,"A"),(72,"B"),(94,"C"),(110,"D"),(122,"E"),(999,"F")]
fam=[];famset=set()
for i,(uid,u,f,c) in enumerate(top):
    uid=int(uid);r=next(k for n,k in cuts if i<n);o=rows.get(uid)
    fam.append("\t".join(map(str,[u,uid,c,r,o[4] if o else 'o',o[3] if o else 3000,f])));famset.add(uid)
maxpp={};bym=defaultdict(list)
for name,uid,cc,pp,m in rows.values():
    maxpp[m]=max(maxpp.get(m,0),pp)
    if uid not in famset: bym[m].append(pp)
fr=[.0025,.025,.10,.22,.30]  # A,B,C,D,E доли
TH={}
for m,l in bym.items():
    l.sort(reverse=True);acc=0;t=[]
    for x in fr: acc+=x;t.append(l[min(len(l)-1,int(len(l)*acc))])
    TH[m]=t
def b36(n):
    s='';a='0123456789abcdefghijklmnopqrstuvwxyz'
    while True:
        n,r=divmod(n,36);s=a[r]+s
        if n==0: return s
grp=defaultdict(list)
for name,uid,cc,pp,m in rows.values():
    if uid in famset: continue
    grp[(cc,m)].append((pp,name,uid))
out=[]
for (cc,m),l in sorted(grp.items()):
    out.append('\x01'+cc+m)
    for pp,name,uid in sorted(l,reverse=True): out.append(f'{name}\t{b36(uid)}\t{b36(pp)}')
open(d+'data5.txt','w').write("\n".join(out));open(d+'fam5.txt','w').write("\n".join(fam))
json.dump({'TH':TH,'MAXPP':maxpp},open(d+'meta5.json','w'))
print(len(rows),len(out),TH,maxpp)
