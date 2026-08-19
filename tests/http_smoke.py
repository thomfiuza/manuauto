import http.cookiejar,json,urllib.error,urllib.request
BASE='http://localhost:3000'
for path in ['/','/auth']:
 with urllib.request.urlopen(BASE+path,timeout=15) as response:
  assert response.status==200 and len(response.read())>500
with urllib.request.urlopen(BASE+'/api/health',timeout=15) as response:
 data=json.load(response);assert data['status']=='ok' and data['database']=='ok'
jar=http.cookiejar.CookieJar();client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
request=urllib.request.Request(BASE+'/api/auth/sign-in/email',data=json.dumps({'email':'thomaz@manuauto.local','password':'ManuautoLocal2026!'}).encode(),headers={'Content-Type':'application/json','Origin':BASE},method='POST')
with client.open(request,timeout=15) as response:assert response.status==200
assert any(cookie.name.endswith('session_token') for cookie in jar)
with client.open(urllib.request.Request(BASE+'/api/auth/get-session',headers={'Origin':BASE}),timeout=15) as response:
 data=json.load(response);assert data['user']['email']=='thomaz@manuauto.local';assert data['user']['role']=='admin'
for path in ['/consulta','/biblioteca','/dicas','/moderacao']:
 with client.open(BASE+path,timeout=15) as response:assert response.status==200 and len(response.read())>500
with client.open(BASE+'/api/vehicles',timeout=15) as response:
 vehicles=json.load(response);vehicle=next(x for x in vehicles if x['model']=='Symbol' and x['engineCode']=='K4M')
try:urllib.request.urlopen(BASE+'/api/documents/00000000-0000-0000-0000-000000000000',timeout=15)
except urllib.error.HTTPError as error:assert error.code==401
try:urllib.request.urlopen(urllib.request.Request(BASE+'/api/documents/upload',data=b'',method='POST'),timeout=15)
except urllib.error.HTTPError as error:assert error.code==401
Path=__import__('pathlib').Path;private=Path(__file__).resolve().parents[2]/'uploads/79155803-Manual-Symbol.pdf';fixture=Path(__file__).resolve().parent/'fixtures/sample-manual.pdf';boundary='----manuauto-test';pdf=(private if private.exists() else fixture).read_bytes();parts=[]
def field(name,value):return f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode()
for name,value in [('vehicleId',vehicle['id']),('title','Documento duplicado'),('visibility','private'),('rights','false')]:parts.append(field(name,value))
parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="manual.pdf"\r\nContent-Type: application/pdf\r\n\r\n'.encode()+pdf+b'\r\n');parts.append(f'--{boundary}--\r\n'.encode());body=b''.join(parts)
request=urllib.request.Request(BASE+'/api/documents/upload',data=body,headers={'Content-Type':f'multipart/form-data; boundary={boundary}','Origin':BASE},method='POST')
try:client.open(request,timeout=60)
except urllib.error.HTTPError as error:assert error.code==409
print('HTTP/auth/storage smoke: PASS')
