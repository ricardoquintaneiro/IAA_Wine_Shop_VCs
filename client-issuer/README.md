# IAA_Wine_Shop_VCs - Client Issuer

## Instal dependencies

```bash
$ npm init -y
$ npm install @digitalbazaar/vc
$ npm install @digitalbazaar/did-method-key
$ npm install @digitalbazaar/did-method-web
$ npm install @digitalbazaar/ecdsa-multikey
$ npm install @digitalbazaar/ecdsa-rdfc-2019-cryptosuite
$ npm install @digitalbazaar/data-integrity
$ npm install @digitalbazaar/security-document-loader
$ npm install @digitalbazaar/data-integrity-context
```

**Ensure you are using version 22 of Node**

```bash
$ node --version
```

## Generate the VCs

```bash
$ cd client-issuer && node clientVCIssuer.mjs
```
