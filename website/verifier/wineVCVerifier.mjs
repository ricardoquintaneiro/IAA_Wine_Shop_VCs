import * as DidKey from "@digitalbazaar/did-method-key";
import * as DidWeb from "@digitalbazaar/did-method-web";
import * as EcdsaMultikey from "@digitalbazaar/ecdsa-multikey";
import { cryptosuite as ecdsaRdfc2019Cryptosuite } from "@digitalbazaar/ecdsa-rdfc-2019-cryptosuite";

import * as vc from "@digitalbazaar/vc";
import { CachedResolver } from "@digitalbazaar/did-io";
import { DataIntegrityProof } from "@digitalbazaar/data-integrity";
import { securityLoader } from "@digitalbazaar/security-document-loader";
import { contexts as diContexts } from "@digitalbazaar/data-integrity-context";
import fs from "fs";
import cors from "cors";

import credentialsV1 from "./context/credentials-v1.json" with { type: "json" };

import express from "express";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// setup documentLoader with security contexts
const loader = securityLoader();
loader.addDocuments({ documents: diContexts });

//Load the JSON-LD context for the credential
//The documentloader will load JSON-Schemas to validate the credential format.
loader.addStatic(
  "https://www.w3.org/ns/odrl.jsonld",
  await fetch("https://www.w3.org/ns/odrl.jsonld").then((res) => res.json())
);

loader.addStatic("https://www.w3.org/2018/credentials/v1", credentialsV1);

// Add custom wine context
loader.addStatic("https://example.com/wine-context/v1", {
  "@context": {
    "@version": 1.1,
    "@protected": true,
    WineCertificationCredential:
      "https://example.com/wine-context#WineCertificationCredential",
    productId: "https://example.com/wine-context#productId",
    productName: "https://example.com/wine-context#productName",
    productType: "https://example.com/wine-context#productType",
    wineType: "https://example.com/wine-context#wineType",
    origin: "https://example.com/wine-context#origin",
    country: "https://example.com/wine-context#country",
    region: "https://example.com/wine-context#region",
    subRegion: "https://example.com/wine-context#subRegion",
    producer: "https://example.com/wine-context#producer",
    name: "https://example.com/wine-context#name",
    did: "https://example.com/wine-context#did",
    certifications: "https://example.com/wine-context#certifications",
    certificationType: "https://example.com/wine-context#certificationType",
    certifyingAuthority: "https://example.com/wine-context#certifyingAuthority",
    certificateId: "https://example.com/wine-context#certificateId",
    certificationDate: "https://example.com/wine-context#certificationDate",
    grapeVarieties: "https://example.com/wine-context#grapeVarieties",
    alcoholContent: "https://example.com/wine-context#alcoholContent",
    value: "https://example.com/wine-context#value",
    unit: "https://example.com/wine-context#unit",
    volume: "https://example.com/wine-context#volume",
    analyticalData: "https://example.com/wine-context#analyticalData",
    fixedAcidity: "https://example.com/wine-context#fixedAcidity",
    volatileAcidity: "https://example.com/wine-context#volatileAcidity",
    citricAcid: "https://example.com/wine-context#citricAcid",
    residualSugar: "https://example.com/wine-context#residualSugar",
    chlorides: "https://example.com/wine-context#chlorides",
    freeSulfurDioxide: "https://example.com/wine-context#freeSulfurDioxide",
    totalSulfurDioxide: "https://example.com/wine-context#totalSulfurDioxide",
    density: "https://example.com/wine-context#density",
    pH: "https://example.com/wine-context#pH",
    sulphates: "https://example.com/wine-context#sulphates",
    vintage: "https://example.com/wine-context#vintage",
    batchCode: "https://example.com/wine-context#batchCode",
  },
});

const resolver = new CachedResolver();
const didKeyDriverMultikey = DidKey.driver();
const didWebDriver = DidWeb.driver();

didKeyDriverMultikey.use({
  multibaseMultikeyHeader: "zDna",
  fromMultibase: EcdsaMultikey.from,
});

didWebDriver.use({
  multibaseMultikeyHeader: "zDna",
  fromMultibase: EcdsaMultikey.from,
});

// P-384
didWebDriver.use({
  multibaseMultikeyHeader: "z82L",
  fromMultibase: EcdsaMultikey.from,
});
resolver.use(didKeyDriverMultikey);
resolver.use(didWebDriver);
loader.setDidResolver(resolver);
const documentLoader = loader.build();

async function verifyPresentation({ verifiablePresentation, documentLoader, challenge }) {
  // setup example for did:web
  const VP_DID = "did:web:wineshop.pt:issuer:123";
  const VP_DID_URL = "https://wineshop.pt/issuer/123";

  // Load the key pair from the keys list
  const batchCode = verifiablePresentation.verifiableCredential[0].credentialSubject.batchCode;
  const keysFile = "./public-keys/vpEcdsaKeyPairs.json";
  const keysList = JSON.parse(fs.readFileSync(keysFile, "utf8"));
  
  const keyData = keysList.find(k => k.batchCode === batchCode);
  if (!keyData) {
    throw new Error(`No key found for batch code ${batchCode}`);
  }

  const vpEcdsaKeyPair = await EcdsaMultikey.from(keyData.keyPair);

  // Create DID Document
  const { didDocument: vpDidDocument, methodFor: vpMethodFor } =
    await didWebDriver.fromKeyPair({
      url: VP_DID_URL,
      verificationKeyPair: vpEcdsaKeyPair,
    });

  // Get the authentication key and ensure it matches the one in the presentation
  const didWebKey = vpMethodFor({ purpose: "authentication" });
  vpEcdsaKeyPair.id = didWebKey.id;
  vpEcdsaKeyPair.controller = vpDidDocument.id;
  

  // setup VP ecdsa-rdfc-2019 verifying suite
  const vpVerifyingSuite = new DataIntegrityProof({
    cryptosuite: ecdsaRdfc2019Cryptosuite,
  });

  // Add both the DID document and the verification method to the loader
  loader.addStatic(VP_DID, vpDidDocument);

  // const vpDidVm = structuredClone(vpDidDocument.verificationMethod[0]);
  // vpDidVm["@context"] = "https://w3id.org/security/multikey/v1";  
  // loader.addStatic(vpDidVm.id, vpDidVm);
  const vpDidVm = {
    ...vpDidDocument.verificationMethod[0],
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/multikey/v1"
    ]
  };
  loader.addStatic(vpDidVm.id, vpDidVm);

  // verify signed presentation
  const verifyPresentationResult = await vc.verify({
    presentation: verifiablePresentation,
    challenge,
    suite: vpVerifyingSuite,
    documentLoader,
  });

  return verifyPresentationResult;
}

// API endpoint for verification
app.post("/verify", async (req, res) => {
  try {
    const verifiablePresentation = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body.verifiablePresentation || req.body;
    const challenge = "wine-challenge-321"; // Hardcoded for development purposes

    if (!verifiablePresentation) {
      return res
        .status(400)
        .json({ error: "No verifiable presentation provided" });
    }

    console.log("VERIFIABLE PRESENTATION:", verifiablePresentation);

    const result = await verifyPresentation({
      verifiablePresentation,
      documentLoader,
      challenge,
    });

    if (result.error) {
      return res.status(400).json({
        verified: false,
        error: result.error.errors[0].message,
      });
    }

    res.json({
      verified: result.verified,
      results: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Verifier API listening on port ${port}`);
});
