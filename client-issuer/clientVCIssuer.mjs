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

// Custom client VC
loader.addStatic("https://example.com/client-context/v1", {
  "@context": {
    "@version": 1.1,
    "@protected": true,
    AgeVerificationCredential: "https://example.com/AgeVerificationCredential",
    clientID: "https://example.com/clientID",
    clientName: "https://example.com/clientName",
    dateOfBirth: "https://example.com/dateOfBirth",
    ofLegalAge: "https://example.com/ofLegalAge",
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

didWebDriver.use({
  multibaseMultikeyHeader: "z82L",
  fromMultibase: EcdsaMultikey.from,
});

resolver.use(didKeyDriverMultikey);
resolver.use(didWebDriver);
loader.setDidResolver(resolver);

const documentLoader = loader.build();

async function createCredentialForProduct(
  clientData,
  vcEcdsaKeyPair,
  vcSigningSuite
) {
  const credential = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://example.com/client-context/v1",
    ],
    id: `urn:uuid:${uuidv4()}`,
    type: ["VerifiableCredential", "AgeVerificationCredential"],
    issuer: vcEcdsaKeyPair.controller,
    issuanceDate: new Date().toISOString(),
    expirationDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ).toISOString(),
    credentialSubject: clientData.credentialSubject,
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

  // Load client data
  console.log("Loading client-dataset.json");
  const clientDataset = JSON.parse(
    fs.readFileSync("client-dataset.json", "utf8")
  );

  // Create client-VCs directory if it doesn't exist
  const vcDir = "../client-VCs";
  if (!fs.existsSync(vcDir)) {
    fs.mkdirSync(vcDir);
    console.log(`Created directory: ${vcDir}`);
  }

  // Process each client
  for (let i = 0; i < clientDataset.clients.length; i++) {
    const client = clientDataset.clients[i];
    console.log(
      `Processing client ${i + 1}: ${client.credentialSubject.clientName}`
    );

    try {
      const vc = await createCredentialForProduct(
        client,
        vcEcdsaKeyPair,
        vcSigningSuite
      );

      // Save individual credential in client-VCs folder
      const filename = `${vcDir}/vc-${
        client.credentialSubject.clientName || i + 1
      }.json`;
      fs.writeFileSync(filename, JSON.stringify(vc, null, 2));
      console.log(`✓ Saved: ${filename}`);
    } catch (error) {
      console.error(`✗ Error processing client ${i + 1}:`, error.message);
    }
  }

  console.log(
    `\n Generated ${clientDataset.clients.length} clients credentials successfully in ${vcDir}/ folder!`
  );
}

await main();
