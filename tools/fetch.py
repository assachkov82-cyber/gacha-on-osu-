import subprocess,sys,os,re,concurrent.futures as cf,time
D=sys.argv[1];cs=open(D+'/countries.txt').read().split()
jobs=[('osu',c,200) for c in cs]+[(m,c,40) for m in ('mania','taiko','fruits') for c in cs[:40]]
def get(mode,c,p):
    f=f'{D}/ck/{mode}_{c}_{p}.html'
    if os.path.exists(f) and os.path.getsize(f)>1000: return open(f,encoding='utf-8',errors='ignore').read()
    for t in range(4):
        r=subprocess.run(['curl','-sSL','--max-time','30',f'https://osu.ppy.sh/rankings/{mode}/performance?country={c}&page={p}'],capture_output=True)
        h=r.stdout.decode('utf-8','ignore')
        if 'ranking-page' in h: open(f,'w').write(h);return h
        time.sleep(2*(t+1))
    return ''
def job(j):
    mode,c,mx=j;n=0
    for p in range(1,mx+1):
        h=get(mode,c,p);k=h.count('data-user-id')
        n+=k
        if k<50: break
    return mode,c,n
tot=0
with cf.ThreadPoolExecutor(10) as ex:
    for mode,c,n in ex.map(job,jobs):
        tot+=n;print(mode,c,n,tot,flush=True)
print('DONE',tot)
