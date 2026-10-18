"""Crea una identidad Android estable; los valores se envían por stdin, nunca se imprimen."""
from pathlib import Path
import base64, datetime, os, secrets, subprocess
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import pkcs12
from cryptography.x509.oid import NameOID
root=Path(__file__).resolve().parents[1]
folder=root/'.signing';folder.mkdir(exist_ok=True)
keyfile=folder/'marco-editor.p12';passfile=folder/'password.txt'
if keyfile.exists()!=passfile.exists():raise SystemExit('Falta una parte de la firma existente. No se generará otra identidad.')
if not keyfile.exists():
    key=rsa.generate_private_key(public_exponent=65537,key_size=3072)
    name=x509.Name([x509.NameAttribute(NameOID.COMMON_NAME,'Marco Pescador - Marco Editor')])
    now=datetime.datetime.now(datetime.UTC)
    cert=x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(key.public_key()).serial_number(x509.random_serial_number()).not_valid_before(now-datetime.timedelta(days=1)).not_valid_after(now+datetime.timedelta(days=10950)).sign(key,hashes.SHA256())
    password=secrets.token_hex(24)
    keyfile.write_bytes(pkcs12.serialize_key_and_certificates(b'marco-editor',key,cert,None,serialization.BestAvailableEncryption(password.encode())))
    passfile.write_text(password,encoding='utf-8')
gh=os.environ.get('GH_EXECUTABLE','gh')
for name,value in [('ANDROID_KEYSTORE',base64.b64encode(keyfile.read_bytes())),('ANDROID_KEY_PASSWORD',passfile.read_bytes())]:
    subprocess.run([gh,'secret','set',name,'--repo','Peskysa/marco-editor'],input=value,check=True)
print('Firma Android propia conservada fuera de Git y configurada en los secretos del repositorio.')
