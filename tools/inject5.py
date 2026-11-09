"""Собирает index.html из шаблона и данных.
Запуск из корня репозитория:  python3 tools/inject5.py
"""
import json,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D=os.path.join(R,'data')
h=open(os.path.join(R,'src','game.template.html'),encoding='utf-8').read()
m=json.load(open(os.path.join(D,'meta5.json')))
rd=lambda f:open(os.path.join(D,f),encoding='utf-8').read()
h=(h.replace('/*FAM*/',rd('fam5.txt')).replace('/*DATA*/',rd('data5.txt'))
    .replace('/*TH*/',json.dumps(m['TH'])).replace('/*MAXPP*/',json.dumps(m['MAXPP']))
    .replace('/*OLD*/',rd('old.json').strip()).replace('/*COV*/',rd('covers.txt')))
import base64
b64=lambda f:base64.b64encode(open(os.path.join(R,'assets',f),'rb').read()).decode()
h=h.replace('/*LOGO*/',b64('logo-512.webp')).replace('/*FAVICON*/',b64('favicon-64.png')).replace('/*PPICON*/',b64('pp-64.webp'))
open(os.path.join(R,'index.html'),'w',encoding='utf-8').write(h)
print('index.html собран:',len(h)//1024,'КБ')
