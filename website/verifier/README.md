# IAA_Wine_Shop_VCs - Website Verifier

## Install dependencies

```bash
$ npm init -y

$ npm install express --save

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

## Run and interact with the VC Verification API

In terminal 1:
```bash
$ cd website/verifier && node wineVCVerifier.mjs
```

In terminal 2:
```bash
$ curl -X POST http://localhost:3000/verify -H "Content-Type: application/json" -d @../wine-VPs/vp-ACN257172.json
```
The sent request data (`-d` flag) can be the path to a file or a JSON string.