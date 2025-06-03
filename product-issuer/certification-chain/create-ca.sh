#!/bin/bash
set -e

# 1. Create directories for certs and keys
mkdir -p rootCA intermediateCA

echo "=== Generating Root CA ==="

# 2. Generate Root CA private key (ECDSA P-256)
openssl ecparam -name prime256v1 -genkey -noout -out rootCA/rootCA.key.pem

# 3. Create Root CA self-signed certificate
openssl req -x509 -new -nodes -key rootCA/rootCA.key.pem -sha256 -days 3650 \
  -out rootCA/rootCA.cert.pem \
  -subj "/C=US/ST=CA/O=Example Root CA/CN=Example Root CA"

# 4. Extract Root CA public key in PEM format
openssl ec -in rootCA/rootCA.key.pem -pubout -out rootCA/rootCA.pub.pem

# 5. Convert Root CA public key to JWK format
openssl ec -in rootCA/rootCA.key.pem -pubout -outform DER | \
  openssl base64 -A | \
  jq -Rsj '{"kty":"EC","crv":"P-256","x":(split(".")[0]|@base64d|.[0:32]|@base64),"y":(split(".")[0]|@base64d|.[32:64]|@base64)}' > \
  rootCA/rootCA.pub.jwk

echo "=== Generating Intermediate CA (Issuer) ==="

# 6. Generate Intermediate CA private key (in PKCS#8 format)
openssl ecparam -name prime256v1 -genkey -noout | \
  openssl pkcs8 -topk8 -nocrypt -out intermediateCA/issuer.key.pem

# 7. Create Intermediate CA CSR
openssl req -new -key intermediateCA/issuer.key.pem -out intermediateCA/issuer.csr.pem \
  -subj "/C=US/ST=CA/O=Example Intermediate CA/CN=Example Issuer CA"

# 8. Create Intermediate CA certificate signed by Root CA (valid 5 years)
openssl x509 -req -in intermediateCA/issuer.csr.pem -CA rootCA/rootCA.cert.pem -CAkey rootCA/rootCA.key.pem \
  -CAcreateserial -out intermediateCA/issuer.cert.pem -days 1825 -sha256

# 9. Extract Intermediate CA public key in PEM format
openssl ec -in intermediateCA/issuer.key.pem -pubout -out intermediateCA/issuer.pub.pem

# 10. Convert Intermediate CA public key to JWK format
openssl ec -in intermediateCA/issuer.key.pem -pubout -outform DER | \
  openssl base64 -A | \
  jq -Rsj '{"kty":"EC","crv":"P-256","x":(split(".")[0]|@base64d|.[0:32]|@base64),"y":(split(".")[0]|@base64d|.[32:64]|@base64)}' > \
  intermediateCA/issuer.pub.jwk

# 11. Verify certificate chain
openssl verify -CAfile rootCA/rootCA.cert.pem intermediateCA/issuer.cert.pem

echo "=== Done ==="
echo "Root CA files:"
echo "  Private key: rootCA/rootCA.key.pem"
echo "  Certificate: rootCA/rootCA.cert.pem"
echo "  Public key (PEM): rootCA/rootCA.pub.pem"
echo "  Public key (JWK): rootCA/rootCA.pub.jwk"
echo ""
echo "Intermediate CA (Issuer) files:"
echo "  Private key: intermediateCA/issuer.key.pem"
echo "  Certificate: intermediateCA/issuer.cert.pem"
echo "  Public key (PEM): intermediateCA/issuer.pub.pem"
echo "  Public key (JWK): intermediateCA/issuer.pub.jwk"