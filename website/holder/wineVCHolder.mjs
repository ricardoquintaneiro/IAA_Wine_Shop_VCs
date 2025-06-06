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

import credentialsV1 from "./context/credentials-v1.json" with { type: "json" };

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
    "WineCertificationCredential": "https://example.com/wine-context#WineCertificationCredential",
    "productId": "https://example.com/wine-context#productId",
    "productName": "https://example.com/wine-context#productName",
    "productType": "https://example.com/wine-context#productType",
    "wineType": "https://example.com/wine-context#wineType",
    "origin": "https://example.com/wine-context#origin",
    "country": "https://example.com/wine-context#country",
    "region": "https://example.com/wine-context#region",
    "subRegion": "https://example.com/wine-context#subRegion",
    "producer": "https://example.com/wine-context#producer",
    "name": "https://example.com/wine-context#name",
    "did": "https://example.com/wine-context#did",
    "certifications": "https://example.com/wine-context#certifications",
    "certificationType": "https://example.com/wine-context#certificationType",
    "certifyingAuthority": "https://example.com/wine-context#certifyingAuthority",
    "certificateId": "https://example.com/wine-context#certificateId",
    "certificationDate": "https://example.com/wine-context#certificationDate",
    "grapeVarieties": "https://example.com/wine-context#grapeVarieties",
    "alcoholContent": "https://example.com/wine-context#alcoholContent",
    "value": "https://example.com/wine-context#value",
    "unit": "https://example.com/wine-context#unit",
    "volume": "https://example.com/wine-context#volume",
    "analyticalData": "https://example.com/wine-context#analyticalData",
    "fixedAcidity": "https://example.com/wine-context#fixedAcidity",
    "volatileAcidity": "https://example.com/wine-context#volatileAcidity",
    "citricAcid": "https://example.com/wine-context#citricAcid",
    "residualSugar": "https://example.com/wine-context#residualSugar",
    "chlorides": "https://example.com/wine-context#chlorides",
    "freeSulfurDioxide": "https://example.com/wine-context#freeSulfurDioxide",
    "totalSulfurDioxide": "https://example.com/wine-context#totalSulfurDioxide",
    "density": "https://example.com/wine-context#density",
    "pH": "https://example.com/wine-context#pH",
    "sulphates": "https://example.com/wine-context#sulphates",
    "vintage": "https://example.com/wine-context#vintage",
    "batchCode": "https://example.com/wine-context#batchCode"
  }
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

//Create a VC PRESENTATION by the HOLDER to a VERIFIER
async function main({ verifiableCredential, documentLoader }, vpFileName) {
  // setup example for did:web
  const VP_DID = "did:web:wineshop.pt:issuer:123";
  const VP_DID_URL = "https://wineshop.pt/issuer/123"; // The target DID URL

  // generate example keypair for VP signer (The HOLDER)
  const vpEcdsaKeyPair = await EcdsaMultikey.generate({ curve: "P-384" });
  fs.writeFileSync(
    "vpEcdsaKeyPair.json",
    JSON.stringify(await vpEcdsaKeyPair.export({ publicKey: true }))
  );

  const { didDocument: vpDidDocument, methodFor: vpMethodFor } =
    await didWebDriver.fromKeyPair({
      url: VP_DID_URL,
      verificationKeyPair: vpEcdsaKeyPair,
    });

  const didWebKey = vpMethodFor({ purpose: "authentication" });
  vpEcdsaKeyPair.id = didWebKey.id;
  vpEcdsaKeyPair.controller = vpDidDocument.id;

  const vpSigningSuite = new DataIntegrityProof({
    signer: vpEcdsaKeyPair.signer(),
    cryptosuite: ecdsaRdfc2019Cryptosuite,
  });

  loader.addStatic(VP_DID, vpDidDocument);
  //loader.addStatic(VP_DID_DOC_URL, vpDidDocument);

  // using a static verification method result
  // In the real world, this would be fetched from the DID Document
  const vpDidVm = structuredClone(vpDidDocument.verificationMethod[0]);
  vpDidVm["@context"] = "https://w3id.org/security/multikey/v1";
  loader.addStatic(vpDidVm.id, vpDidVm);

  // presentation holder
  const holder = "did:web:ua.pt:holder:student:456";
  // presentation challenge - required for authentication proof purpose
  const challenge = "wine-challenge-321";
  // presentation domain - optional in this use case
  const domain = "https://wineshop.pt/";

  const presentation = await vc.createPresentation({
    verifiableCredential,
    holder,
  });

  console.log("PRESENTATION:");
  console.log(JSON.stringify(presentation, null, 2));

  // sign presentation
  // note this adds the proof to the input presentation
  const vp = await vc.signPresentation({
    presentation,
    suite: vpSigningSuite,
    challenge,
    domain,
    documentLoader,
  });

  console.log("SIGNED WINE PRESENTATION:");
  console.log(JSON.stringify(vp, null, 2));

  // Create wine-VCs directory if it doesn't exist
  const vpDir = "../wine-VPs";
  if (!fs.existsSync(vpDir)) {
    fs.mkdirSync(vpDir);
    console.log(`Created directory: ${vpDir}`);
  }

  // Save the wine VPs
  const vpPath = `${vpDir}/${vpFileName}`;
  fs.writeFileSync(vpPath, JSON.stringify(vp, null, 2));
  console.log(`Signed VP saved to: ${vpPath}`);
}

const wineVCsDir = "../../wine-VCs";

try {
    const files = fs.readdirSync(wineVCsDir);

    if (files.length === 0) {
        console.error("❌ No files found in wine-VCs directory");
        process.exit(1);
    }

    for (const file of files) {
        if (file.endsWith(".json")) {
            const vcPath = `${wineVCsDir}/${file}`;
            const credential = JSON.parse(fs.readFileSync(vcPath, "utf8"));
            const vpFileName = "vp" + file.substring(2);

            try {
                console.log("Creating Signed Presentation");
                await main({ verifiableCredential: credential, documentLoader }, vpFileName);              
            } catch (error) {
                console.error("❌ Error creating signed presentation:", error.message);
            }
        }
    }
    
} catch (error) {
    console.error("❌ Error loading wine VCs:", error.message);
    process.exit(1);
}

