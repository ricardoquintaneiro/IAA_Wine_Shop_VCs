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
import { v4 as uuidv4 } from "uuid";

import credentialsV1 from "./context/credentials-v1.json" with { type: "json" };

// setup documentLoader with security contexts
const loader = securityLoader();
loader.addDocuments({ documents: diContexts });

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

didWebDriver.use({
  multibaseMultikeyHeader: "z82L",
  fromMultibase: EcdsaMultikey.from,
});

resolver.use(didKeyDriverMultikey);
resolver.use(didWebDriver);
loader.setDidResolver(resolver);

const documentLoader = loader.build();

async function createCredentialForProduct(
  productData,
  vcEcdsaKeyPair,
  vcSigningSuite
) {
  const credential = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://example.com/wine-context/v1",
    ],
    id: `urn:uuid:${uuidv4()}`,
    type: ["VerifiableCredential", "WineCertificationCredential"],
    issuer: vcEcdsaKeyPair.controller,
    issuanceDate: new Date().toISOString(),
    expirationDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ).toISOString(),
    credentialSubject: productData.credentialSubject,
  };

  // Sign credential
  const verifiableCredential = await vc.issue({
    credential,
    suite: vcSigningSuite,
    documentLoader,
  });

  return verifiableCredential;
}

async function main() {
  // Generate example keypair for VC signer (reuse for all credentials)
  const vcEcdsaKeyPair = await EcdsaMultikey.generate({ curve: "P-256" });

  const { didDocument: vcDidDocument } = await didKeyDriverMultikey.fromKeyPair(
    {
      verificationKeyPair: vcEcdsaKeyPair,
    }
  );

  vcEcdsaKeyPair.id = vcDidDocument.assertionMethod[0];
  vcEcdsaKeyPair.controller = vcDidDocument.id;

  // Setup ecdsa-rdfc-2019 signing suite
  const vcSigningSuite = new DataIntegrityProof({
    signer: vcEcdsaKeyPair.signer(),
    cryptosuite: ecdsaRdfc2019Cryptosuite,
  });

  // Load wine dataset
  console.log("Loading wine-dataset.json");
  const wineDataset = JSON.parse(fs.readFileSync("wine-dataset.json", "utf8"));

  // Create wine-VCs directory if it doesn't exist
  const vcDir = "../wine-VCs";
  if (!fs.existsSync(vcDir)) {
    fs.mkdirSync(vcDir);
    console.log(`Created directory: ${vcDir}`);
  }

  // Process each product
  for (let i = 0; i < wineDataset.products.length; i++) {
    const product = wineDataset.products[i];
    console.log(
      `Processing product ${i + 1}: ${product.credentialSubject.productName}`
    );

    try {
      const vc = await createCredentialForProduct(
        product,
        vcEcdsaKeyPair,
        vcSigningSuite
      );

      // Save individual credential in wine-VCs folder
      const filename = `${vcDir}/vc-${
        product.credentialSubject.batchCode || i + 1
      }.json`;
      fs.writeFileSync(filename, JSON.stringify(vc, null, 2));
      console.log(`✓ Saved: ${filename}`);
    } catch (error) {
      console.error(`✗ Error processing product ${i + 1}:`, error.message);
    }
  }

  console.log(
    `\n🍷 Generated ${wineDataset.products.length} wine credentials successfully in ${vcDir}/ folder!`
  );
}

await main();
