import re,glob,json,sys
d=sys.argv[1]
rows={}
for f in sorted(glob.glob(d+'/rk/*.html')):
  mode=f.split('/')[-1].split('_')[0]
  h=open(f,encoding='utf-8').read()
  for tr in h.split('ranking-page-table__row')[1:]:
    m=re.search(r'data-user-id="(\d+)"',tr)
    if not m: continue
    uid=int(m.group(1))
    name=re.search(r'u-ellipsis-overflow"[^>]*>\s*(.*?)\s*</span>',tr,re.S).group(1)
    import html; name=html.unescape(name)
    cc=re.search(r'country=([A-Z]{2})',tr); cc=cc.group(1) if cc else '??'
    rank=int(re.search(r'#([\d,]+)',tr).group(1).replace(',',''))
    tds=re.findall(r'<td[^>]*>\s*([^<]*?)\s*</td>',tr)
    pp=int(tds[5].replace(',',''))
    if uid in rows: continue
    rows[uid]=[name,uid,cc,pp,rank,mode]
json.dump(list(rows.values()),open(d+'/ranked.json','w'),ensure_ascii=False)
print(len(rows)); print(list(rows.values())[:3])
