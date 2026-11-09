"""Собственные звуковые эффекты osu! Gacha Tower в стиле 16-битных консолей (FM как у Sega Genesis,
32 кГц как у SNES, эхо). Рендер в 16-бит PCM моно 32 кГц → FLAC (без потерь) assets/sounds/*.flac (нужен ffmpeg).
Запуск: python3 tools/sfx16.py"""
import numpy as np, wave, os
SR=32000
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(R,'assets','sounds')
rng=np.random.default_rng(7)
class Sig(np.ndarray):
    """сигнал: сложение сигналов разной длины дополняет короткий нулями"""
    def __add__(s,o):
        if isinstance(o,np.ndarray) and s.ndim==1 and o.ndim==1 and len(o)!=len(s):
            n=max(len(s),len(o));return (np.pad(np.asarray(s),(0,n-len(s)))+np.pad(np.asarray(o),(0,n-len(o)))).view(Sig)
        return np.ndarray.__add__(s,o)
    __radd__=__add__
def t(d): return (np.arange(int(SR*d))/SR).view(Sig)
def env(n,a=.005,d=.08,s=.6,r=.1,hold=None):
    """ADSR-огибающая длиной n сэмплов"""
    A=int(a*SR);D=int(d*SR);Rr=int(r*SR);H=n-A-D-Rr if hold is None else int(hold*SR)
    H=max(0,H);e=np.concatenate([np.linspace(0,1,max(1,A)),np.linspace(1,s,max(1,D)),np.full(H,s),np.linspace(s,0,max(1,Rr))])
    return np.pad(e,(0,max(0,n-len(e))))[:n]
def expd(n,k): return np.exp(-np.arange(n)/SR*k).view(Sig)
def note(m): return 440*2**((m-69)/12)
def fm(freq,d,ratio=1.,index=2.,idec=6.,amp_env=None,fb=0.):
    """2-операторный FM (модулятор → несущая), индекс модуляции затухает"""
    x=t(d);f=np.broadcast_to(freq,x.shape) if np.ndim(freq) else np.full(x.shape,freq)
    ph=2*np.pi*np.cumsum(f)/SR;mph=ph*ratio
    I=index*np.exp(-x*idec);mod=np.sin(mph+fb*np.sin(mph))
    y=np.sin(ph+I*mod)
    return y*(amp_env if amp_env is not None else 1)
def sq(freq,d,duty=.5):
    x=t(d);f=np.broadcast_to(freq,x.shape) if np.ndim(freq) else np.full(x.shape,freq)
    ph=(np.cumsum(f)/SR)%1;return np.where(ph<duty,1.,-1.)
def saw(freq,d):
    x=t(d);f=np.broadcast_to(freq,x.shape) if np.ndim(freq) else np.full(x.shape,freq)
    return 2*((np.cumsum(f)/SR)%1)-1
def noise(d): return rng.uniform(-1,1,int(SR*d)).view(Sig)
def lp(x,fc):
    """однополюсный НЧ-фильтр, fc может меняться во времени"""
    fc=np.broadcast_to(fc,x.shape) if np.ndim(fc) else np.full(x.shape,fc)
    a=np.exp(-2*np.pi*fc/SR);y=np.zeros_like(x);z=0.
    for i in range(len(x)):z=(1-a[i])*x[i]+a[i]*z;y[i]=z
    return y
def hp(x,fc): return x-lp(x,fc)
def echo(x,delay=.11,fb=.35,mix=.3,tail=.4):
    D=int(delay*SR);y=np.concatenate([x,np.zeros(int(tail*SR))]);out=y.copy()
    for i in range(D,len(out)):out[i]+=out[i-D]*fb
    return (y*(1-mix)+out*mix).view(Sig)
def mixat(base,x,at):
    i=int(at*SR);n=max(len(base),i+len(x));b=np.pad(np.asarray(base),(0,n-len(base)));b[i:i+len(x)]+=np.asarray(x);return b.view(Sig)
def seq(notes,fn,step):
    out=np.zeros(1)
    for k,m in enumerate(notes):
        if m is None:continue
        out=mixat(out,fn(note(m)),k*step)
    return out
# --- инструменты ---
def bell(f,d=.5,v=1.): n=int(SR*d);return v*fm(f,d,ratio=3.5,index=3,idec=7,amp_env=expd(n,6))
def brass(f,d=.3,v=1.):n=int(SR*d);e=env(n,.02,.06,.75,.08);return v*fm(f,d,ratio=1,index=2.6*np.minimum(1,t(d)/.04)+.4,idec=1.5,amp_env=e)
def epiano(f,d=.4,v=1.):n=int(SR*d);return v*fm(f,d,ratio=1,index=1.4,idec=5,amp_env=expd(n,5))
def bass(f,d=.25,v=1.):n=int(SR*d);return v*fm(f,d,ratio=.5,index=1.8,idec=8,amp_env=env(n,.004,.05,.6,.05))
def pulse(f,d=.12,v=1.,duty=.25):n=int(SR*d);return v*lp(sq(f,d,duty),5500)*env(n,.002,.03,.5,.04)*.5
def kick(v=1.):d=.18;x=t(d);f=150*np.exp(-x*25)+45;return v*np.sin(2*np.pi*np.cumsum(f)/SR)*expd(len(x),18)
def snare(v=1.):d=.16;n=int(SR*d);return v*(hp(noise(d),1500)*.8+np.sin(2*np.pi*190*t(d))*.4)*expd(n,22)
def cymbal(d=.9,v=1.):n=int(SR*d);return v*lp(hp(noise(d),5000),11000)*expd(n,5)*.22
def norm(x,peak=.89):
    x=x-np.mean(x);m=np.max(np.abs(x))or 1;x=x/m*peak
    f=int(.004*SR);x[:f]*=np.linspace(0,1,f);x[-f*3:]*=np.linspace(1,0,f*3);return x
S={}
# интерфейс
S['click']=fm(1400,.05,ratio=2,index=1.5,idec=60,amp_env=expd(int(SR*.05),70))*.8
S['tab']=mixat(pulse(note(88),.05,1,.5),pulse(note(93),.07,1,.5),.045)
S['flip']=mixat(lp(noise(.12),np.linspace(9000,1500,int(SR*.12)))*expd(int(SR*.12),25),fm(2400,.05,ratio=1.5,index=2,idec=40,amp_env=expd(int(SR*.05),60))*.5,.06)
S['error']=lp(mixat(pulse(note(52),.11,1,.5),pulse(note(47),.16,1,.5),.12),2600)
# бой
d=.16;x=t(d);thump=np.sin(2*np.pi*np.cumsum(170*np.exp(-x*22)+55)/SR)*expd(len(x),16)
S['hit']=thump*.9+lp(noise(d),3500)*expd(len(x),35)*.7+fm(900,d,ratio=1.41,index=4,idec=45,amp_env=expd(len(x),40))*.35
d=.42;n=int(SR*d);x=t(d)
S['crit']=mixat(S['hit']*1.1,fm(note(84)*(1+.5*x/d),d,ratio=3.5,index=4,idec=6,amp_env=expd(n,7))*.55,.02)
S['crit']=mixat(S['crit'],bell(note(91),.35,.4),.06)
d=.55;n=int(SR*d)
S['fight']=hp(noise(d),np.linspace(1500,6000,n))*env(n,.01,.1,.5,.3)*.5+fm(note(86),d,ratio=2.76,index=3,idec=5,amp_env=expd(n,5)*np.minimum(1,t(d)/.08))*.5
S['fight']=echo(S['fight'],.09,.3,.25,.2)
S['skill']=echo(seq([72,76,79,84,88],lambda f:bell(f,.35,.6)+epiano(f/2,.3,.3),.06)+lp(saw(np.linspace(note(60),note(84),int(SR*.45)),.45),2500)*env(int(SR*.45),.02,.1,.4,.2)*.25,.12,.35,.35,.4)
# гача
d=1.0;n=int(SR*d);f=np.geomspace(note(48),note(96),n)
sw=lp(saw(f,d)*.5+saw(f*1.007,d)*.5,np.geomspace(400,9000,n))*env(n,.05,.2,.8,.15)
S['pull']=echo(sw*.7+hp(noise(d),7000)*np.linspace(0,1,n)**2*.25,.1,.3,.3,.3)
S['A']=echo(seq([76,79,83],lambda f:bell(f,.45,.8),.08),.13,.35,.35,.5)
S['S']=echo(seq([72,76,79,84],lambda f:bell(f,.5,.7)+brass(f,.22,.35),.085)+mixat(np.zeros(1),sum(brass(note(m),.5,.25) for m in (72,76,79)),.34),.13,.35,.35,.6)
ss=seq([67,72,76,79,84],lambda f:brass(f,.16,.6),.075);ss=mixat(ss,sum(brass(note(m),.65,.35) for m in (72,76,79,84)),.38)
ss=mixat(ss,cymbal(1.0,.5),.38);ss=mixat(ss,kick(.8),.38);S['SS']=echo(ss,.12,.35,.3,.6)
ex=seq([60,64,67,72,76,79,84,88],lambda f:bell(f,.4,.5)+brass(f,.12,.35),.055)
chord=sum(brass(note(m),1.1,.3)+bell(note(m+12),1.0,.25) for m in (72,76,79,83))
ex=mixat(ex,chord,.46);ex=mixat(ex,cymbal(1.4,.6),.46);ex=mixat(ex,kick(1),.46);ex=mixat(ex,bass(note(48),.9,.6),.46)
d=.5;ex=mixat(ex,lp(saw(np.geomspace(note(60),note(96),int(SR*d)),d),6000)*env(int(SR*d),.02,.1,.6,.2)*.25,0)
S['EX']=echo(ex,.14,.4,.35,.8)
# итоги
w=np.zeros(1)
for k,(m,dd) in enumerate([(72,.11),(72,.11),(72,.11),(72,.42),(68,.42),(70,.42),(72,.2),(70,.12),(72,.8)]):
    pass
mel=[(72,0,.1),(72,.12,.1),(72,.24,.1),(72,.36,.4),(68,.78,.36),(70,1.16,.36),(72,1.54,.14),(70,1.7,.1),(72,1.82,.7)]
for m,at,dd in mel: w=mixat(w,brass(note(m),dd+.05,.6)+pulse(note(m+12),dd,.25,.5),at)
for m,at in [(48,0),(44,.78),(46,1.16),(48,1.54)]: w=mixat(w,bass(note(m),.35,.7),at)
for at in (0,.36,.78,1.16,1.54,1.82): w=mixat(w,kick(.7),at)
w=mixat(w,cymbal(1.0,.4),1.82);S['win']=echo(w,.12,.3,.25,.5)
l=np.zeros(1)
for m,at,dd in [(67,0,.28),(66,.3,.28),(65,.6,.28),(64,.9,.9)]: l=mixat(l,brass(note(m),dd,.5)*np.linspace(1,.7,int(SR*dd))+epiano(note(m-12),dd,.3),at)
l=mixat(l,bass(note(40),1.0,.6),.9);S['lose']=echo(lp(l,3500),.15,.35,.3,.6)
S['lvl']=echo(seq([72,76,79,84,79,84,88,91],lambda f:pulse(f,.09,.6,.25)+bell(f,.3,.4),.055)+mixat(np.zeros(1),sum(bell(note(m),.7,.35) for m in (84,88,91)),.44),.11,.3,.3,.5)
# награды
S['coin']=mixat(bell(note(83),.08,.8)+pulse(note(83),.07,.5,.5),bell(note(88),.45,.9)+pulse(note(88),.3,.4,.5)*expd(int(SR*.3),8),.07)
reg=lp(noise(.08),5000)*expd(int(SR*.08),40)*.6
S['buy']=echo(mixat(mixat(reg,S['coin'],.03),sum(bell(note(m),.5,.3) for m in (88,92,95)),.12),.1,.25,.2,.3)
os.makedirs(OUT,exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith(('.mp3','.wav')):os.remove(os.path.join(OUT,f))
tot=0
for k,x in S.items():
    y=(norm(np.asarray(x,dtype=np.float64))*32767).astype('<i2');p=os.path.join(OUT,k+'.wav')
    with wave.open(p,'wb') as wv: wv.setnchannels(1);wv.setsampwidth(2);wv.setframerate(SR);wv.writeframes(y.tobytes())
    fl=p[:-4]+'.flac';import subprocess
    subprocess.run(['ffmpeg','-v','error','-y','-i',p,'-c:a','flac','-compression_level','12','-sample_fmt','s16',fl],check=True);os.remove(p)
    tot+=os.path.getsize(fl);print(f'{k:6s} {len(y)/SR:4.2f}s')
print('total',tot,'bytes')
