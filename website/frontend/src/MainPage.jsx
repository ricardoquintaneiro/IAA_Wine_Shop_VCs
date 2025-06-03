import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { CiStar } from "react-icons/ci";
import { ImCross } from "react-icons/im";
import wine1 from '../src/assets/wines_photos/castelo_forte_tinto.webp';
import wine2 from "../src/assets/wines_photos/encosta_rose.webp";
import wine3 from "../src/assets/wines_photos/flor_campo_branco.webp";
import wine4 from "../src/assets/wines_photos/pomadao_alvarinho.webp";
import wine5 from "../src/assets/wines_photos/solar_serra_branco.webp";
import wine6 from "../src/assets/wines_photos/vale_secreto_tinto.webp";
import MyNavbar from './components/Navbar';
import MyFooter from './components/Footer';

const featuredWines = [
  {
    id: 1,
    name: "Château Margaux 2018",
    type: "Bordeaux Red",
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.9,
    image: wine1,
    vintage: 2018,
    region: "Bordeaux, France",
    description: "Elegant and complex with notes of blackcurrant and cedar",
    inStock: true,
    isNew: false,
    onSale: true
  },
  {
    id: 2,
    name: "Barolo Riserva DOCG",
    type: "Nebbiolo",
    price: 89.99,
    rating: 4.7,
    image: wine2,
    vintage: 2019,
    region: "Piedmont, Italy",
    description: "Rich and powerful with earthy undertones and cherry notes",
    inStock: true,
    isNew: true,
    onSale: false
  },
  {
    id: 3,
    name: "Dom Pérignon 2012",
    type: "Champagne",
    price: 199.99,
    rating: 4.8,
    image: wine3,
    vintage: 2012,
    region: "Champagne, France",
    description: "Crisp and effervescent with delicate floral aromas",
    inStock: true,
    isNew: false,
    onSale: false
  },
  {
    id: 4,
    name: "Opus One 2020",
    type: "Cabernet Blend",
    price: 429.99,
    rating: 4.9,
    image: wine4,
    vintage: 2020,
    region: "Napa Valley, USA",
    description: "Luxurious blend with intense fruit flavors and silky tannins",
    inStock: false,
    isNew: false,
    onSale: false
  },
  {
    id: 5,
    name: "Riesling Eiswein",
    type: "Dessert Wine",
    price: 124.99,
    rating: 4.6,
    image: wine5,
    vintage: 2021,
    region: "Mosel, Germany",
    description: "Sweet and concentrated with honey and apricot flavors",
    inStock: true,
    isNew: true,
    onSale: false
  },
  {
    id: 6,
    name: "Pinot Noir Reserve",
    type: "Oregon Pinot",
    price: 67.99,
    originalPrice: 79.99,
    rating: 4.5,
    image: wine6,
    vintage: 2022,
    region: "Willamette Valley, USA",
    description: "Smooth and elegant with bright red fruit and earthy finish",
    inStock: true,
    isNew: false,
    onSale: true
  }
];

// Mock verification credential data
const getVerificationData = (wine) => ({
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "id": `urn:credential:wine:${wine.id}:${Date.now()}`,
  "type": ["VerifiableCredential", "ProductCertificationCredential"],
  "issuer": "Wine Certification Authority",
  "issuanceDate": "2024-01-15T10:30:00Z",
  "expirationDate": "2034-01-15T10:30:00Z",
  "credentialSubject": {
    "productId": `urn:epc:id:sgln:123456789.${wine.id}`,
    "productName": wine.name,
    "productType": "Wine",
    "wineType": wine.type,
    "origin": {
      "country": wine.region.split(', ')[1] || "Unknown",
      "region": wine.region.split(', ')[0] || wine.region,
      "subRegion": wine.region,
      "producer": {
        "name": `${wine.name.split(' ')[0]} Winery`,
        "did": `did:wine:producer:${wine.id}`
      }
    },
    "certifications": [
      {
        "certificationType": ["Organic", "Sustainable"],
        "certifyingAuthority": "International Wine Standards",
        "certificateId": `CERT-${wine.id}-2024`,
        "certificationDate": "2024-01-10T00:00:00Z"
      }
    ],
    "grapeVarieties": wine.type === "Bordeaux Red" ? ["Cabernet Sauvignon", "Merlot"] :
      wine.type === "Nebbiolo" ? ["Nebbiolo"] :
        wine.type === "Champagne" ? ["Chardonnay", "Pinot Noir"] :
          wine.type === "Cabernet Blend" ? ["Cabernet Sauvignon", "Merlot", "Cabernet Franc"] :
            wine.type === "Dessert Wine" ? ["Riesling"] : ["Pinot Noir"],
    "alcoholContent": {
      "value": wine.type === "Champagne" ? "12.5" : wine.type === "Dessert Wine" ? "8.5" : "13.5",
      "unit": "%"
    },
    "volume": {
      "value": "750",
      "unit": "ml"
    },
    "analyticalData": {
      "fixedAcidity": { "value": "7.2", "unit": "g/L" },
      "volatileAcidity": { "value": "0.45", "unit": "g/L" },
      "citricAcid": { "value": "0.32", "unit": "g/L" },
      "residualSugar": { "value": "2.1", "unit": "g/L" },
      "chlorides": { "value": "0.078", "unit": "g/L" },
      "freeSulfurDioxide": {
        "value": "32",
        "unit": "mg/L"
      },
      "totalSulfurDioxide": {
        "value": "145",
        "unit": "mg/L"
      },
      "density": { "value": "0.9965", "unit": "g/cm³" },
      "pH": "3.45",
      "sulphates": { "value": "0.65", "unit": "g/L" }
    },
    "vintage": wine.vintage.toString(),
    "batchCode": `BATCH-${wine.id}-${wine.vintage}`
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2024-01-15T10:30:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:wine:authority:123#key-1",
    "proofValue": "z5vK8aWD7...cryptographic_signature_here...9mNKb2x"
  }
});

function VerificationModal({ wine, isOpen, onClose }) {
  const [verificationData] = useState(getVerificationData(wine));

  if (!isOpen) return null;

  const handleVerify = () => {
    alert('Verification process initiated! This would connect to blockchain verification service.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Wine Verification Certificate</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <ImCross className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Product Name:</strong> {verificationData.credentialSubject.productName}</div>
              <div><strong>Product Type:</strong> {verificationData.credentialSubject.wineType}</div>
              <div><strong>Vintage:</strong> {verificationData.credentialSubject.vintage}</div>
              <div><strong>Product ID:</strong> {verificationData.credentialSubject.productId}</div>
            </div>
          </div>

          {/* Origin */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">Origin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Country:</strong> {verificationData.credentialSubject.origin.country}</div>
              <div><strong>Region:</strong> {verificationData.credentialSubject.origin.region}</div>
              <div><strong>Producer:</strong> {verificationData.credentialSubject.origin.producer.name}</div>
              <div><strong>Producer ID:</strong> {verificationData.credentialSubject.origin.producer.did}</div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">Certifications</h3>
            {verificationData.credentialSubject.certifications.map((cert, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div><strong>Type:</strong> {cert.certificationType.join(', ')}</div>
                  <div><strong>Authority:</strong> {cert.certifyingAuthority}</div>
                  <div><strong>Certificate ID:</strong> {cert.certificateId}</div>
                  <div><strong>Date:</strong> {new Date(cert.certificationDate).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Wine Specifics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">Wine Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Grape Varieties:</strong> {verificationData.credentialSubject.grapeVarieties.join(', ')}</div>
              <div><strong>Alcohol Content:</strong> {verificationData.credentialSubject.alcoholContent.value}{verificationData.credentialSubject.alcoholContent.unit}</div>
              <div><strong>Volume:</strong> {verificationData.credentialSubject.volume.value}{verificationData.credentialSubject.volume.unit}</div>
              <div><strong>Batch Code:</strong> {verificationData.credentialSubject.batchCode}</div>
            </div>
          </div>

          {/* Analytical Data */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">Analytical Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div><strong>Fixed Acidity:</strong> {verificationData.credentialSubject.analyticalData.fixedAcidity.value} {verificationData.credentialSubject.analyticalData.fixedAcidity.unit}</div>
              <div><strong>Volatile Acidity:</strong> {verificationData.credentialSubject.analyticalData.volatileAcidity.value} {verificationData.credentialSubject.analyticalData.volatileAcidity.unit}</div>
              <div><strong>Citric Acid:</strong> {verificationData.credentialSubject.analyticalData.citricAcid.value} {verificationData.credentialSubject.analyticalData.citricAcid.unit}</div>
              <div><strong>Residual Sugar:</strong> {verificationData.credentialSubject.analyticalData.residualSugar.value} {verificationData.credentialSubject.analyticalData.residualSugar.unit}</div>
              <div><strong>Chlorides:</strong> {verificationData.credentialSubject.analyticalData.chlorides.value} {verificationData.credentialSubject.analyticalData.chlorides.unit}</div>
              <div><strong>Free SO₂:</strong> {verificationData.credentialSubject.analyticalData.freeSulfurDioxide.value} {verificationData.credentialSubject.analyticalData.freeSulfurDioxide.unit}</div>
              <div><strong>Total SO₂:</strong> {verificationData.credentialSubject.analyticalData.totalSulfurDioxide.value} {verificationData.credentialSubject.analyticalData.totalSulfurDioxide.unit}</div>
              <div><strong>Density:</strong> {verificationData.credentialSubject.analyticalData.density.value} {verificationData.credentialSubject.analyticalData.density.unit}</div>
              <div><strong>pH:</strong> {verificationData.credentialSubject.analyticalData.pH}</div>
              <div><strong>Sulphates:</strong> {verificationData.credentialSubject.analyticalData.sulphates.value} {verificationData.credentialSubject.analyticalData.sulphates.unit}</div>
            </div>
          </div>

          {/* Credential Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">Credential Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Issuer:</strong> {verificationData.issuer}</div>
              <div><strong>Issued:</strong> {new Date(verificationData.issuanceDate).toLocaleDateString()}</div>
              <div><strong>Expires:</strong> {new Date(verificationData.expirationDate).toLocaleDateString()}</div>
              <div><strong>Credential ID:</strong> {verificationData.id}</div>
            </div>
          </div>

          {/* Proof */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">Digital Proof</h3>
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div><strong>Signature Type:</strong> {verificationData.proof.type}</div>
                <div><strong>Created:</strong> {new Date(verificationData.proof.created).toLocaleDateString()}</div>
                <div><strong>Purpose:</strong> {verificationData.proof.proofPurpose}</div>
                <div><strong>Verification Method:</strong> {verificationData.proof.verificationMethod}</div>
              </div>
              <div><strong>Proof Value:</strong> <span className="font-mono text-xs break-all">{verificationData.proof.proofValue}</span></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end">
          <Button
            onPress={handleVerify}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          >
            Verify
          </Button>
        </div>
      </div>
    </div>
  );
}

function WineCard({ wine, onShowDetails }) {
  return (
    <div className="h-full">
      <Card className="shadow-2xl bg-white border border-gray-100 h-full flex flex-col hover:scale-105 hover:shadow-3xl transition-all duration-300 ease-in-out cursor-pointer">
        <CardHeader className="pb-0 pt-2 px-4 relative">
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            {wine.isNew && (
              <Chip size="lg" color="success" variant="flat">
                New
              </Chip>
            )}
            {wine.onSale && (
              <Chip size="lg" color="danger" variant="flat">
                Sale
              </Chip>
            )}
            {!wine.inStock && (
              <Chip size="lg" color="default" variant="flat">
                Out of Stock
              </Chip>
            )}
          </div>
          <div className="">
            <img
              alt={wine.name}
              className="object-cover scale-75 group-hover:scale-110 transition-transform duration-500"
              src={wine.image}
            />
          </div>
        </CardHeader>
        <CardBody className="px-4 pt-0 pb-2 flex-1">
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <CiStar
                key={i}
                className={`h-4 w-4 ${i < Math.floor(wine.rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
                  }`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-1">({wine.rating})</span>
          </div>

          <h4 className="font-bold text-lg text-gray-800 mb-1">{wine.name}</h4>
          <p className="text-sm text-gray-500 mb-1">{wine.type} • {wine.vintage}</p>
          <p className="text-sm text-gray-600 mb-2">{wine.region}</p>
          <p className="text-sm text-gray-600 line-clamp-2">{wine.description}</p>

          <div className="flex items-center gap-2 mt-auto pt-3">
            <span className="text-2xl font-bold text-purple-600">
              ${wine.price}
            </span>
            {wine.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                ${wine.originalPrice}
              </span>
            )}
          </div>
        </CardBody>

        <CardFooter className="pt-0 px-4 pb-4 mt-auto">
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              size="sm"
              isDisabled={!wine.inStock}
            >
              {wine.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              variant="bordered"
              size="sm"
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
              onPress={() => onShowDetails(wine)}
            >
              Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function WineShopLanding() {
  const [selectedWine, setSelectedWine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShowDetails = (wine) => {
    setSelectedWine(wine);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWine(null);
  };

  return (
    <div className="flex flex-col min-h-screen">

      <MyNavbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Wines</h2>
            <p className="text-gray-600">Discover our curated selection of premium wines</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWines.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                onShowDetails={handleShowDetails}
              />
            ))}
          </div>
        </div>
      </main>

      <MyFooter />

      {/* Verification Modal */}
      {selectedWine && (
        <VerificationModal
          wine={selectedWine}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}