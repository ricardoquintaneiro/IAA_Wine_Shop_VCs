import { useState, useEffect } from 'react';
import { ImCross } from "react-icons/im";
import { Button } from '@heroui/button';

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

export default function VC_Modal({ wine, isOpen, onClose }) {
  const [verificationData] = useState(getVerificationData(wine));
  const [showCert, setShowCert] = useState(false);
  const [certContent, setCertContent] = useState('');
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState('');
  const [currentCertType, setCurrentCertType] = useState('');

  if (!isOpen) return null;

  const handleVerify = () => {
    alert('Verification process initiated! This would connect to blockchain verification service.');
  };

  const fetchCertificate = async (certificateType) => {
    setCurrentCertType(certificateType);
    
    // Se já temos o conteúdo do mesmo tipo de certificado, apenas alterna a visualização
    if (certContent && !certError && currentCertType === certificateType) {
      setShowCert(!showCert);
      return;
    }

    setCertLoading(true);
    setCertError('');
    
    try {
      let response;
      if (certificateType === 'intermediate') {
        response = await fetch('/issuer.cert.pem');
      } else if (certificateType === 'root') {
        response = await fetch('/rootCA.cert.pem');
      } else {
        throw new Error('Invalid certificate type');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch certificate: ${response.status} ${response.statusText}`);
      }
      
      const content = await response.text();
      setCertContent(content);
      setShowCert(true);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      setCertError(`Error loading certificate: ${error.message}`);
    } finally {
      setCertLoading(false);
    }
  };

  const downloadCertificate = () => {
    if (!certContent) return;
    
    const fileName = currentCertType === 'intermediate' ? 'issuer.cert.pem' : 'rootCA.cert.pem';
    const element = document.createElement("a");
    const file = new Blob([certContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Certificate view
  if (showCert) {
    const certTitle = currentCertType === 'intermediate' ? 'Intermediate CA Certificate' : 'Root CA Certificate';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCert(false)}>
        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
          {/* Certificate Header */}
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">{certTitle}</h2>
            <button onClick={() => setShowCert(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <ImCross className="w-6 h-6" />
            </button>
          </div>

          {/* Certificate Content */}
          <div className="p-6">
            {certError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <h3 className="font-semibold mb-2">Error Loading Certificate</h3>
                <p>{certError}</p>
                <p className="text-sm mt-2">Make sure the certificate file is located in your public folder.</p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-2">
                    This is the PEM-encoded X.509 certificate used to verify the digital signatures on wine verification credentials.
                  </p>
                </div>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono border">
                  {certContent || 'Loading certificate...'}
                </pre>
              </div>
            )}
          </div>

          {/* Certificate Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex justify-between">
            <Button
              onPress={() => setShowCert(false)}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Back to Verification
            </Button>
            <div className="flex gap-2">
              {certContent && !certError && (
                <Button
                  onPress={downloadCertificate}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Download Certificate
                </Button>
              )}
              {certError && (
                <Button
                  onPress={() => fetchCertificate(currentCertType)}
                  className="bg-purple-600 text-white hover:bg-purple-700"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main verification modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Wine Verifiable Credencial</h2>
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
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
          <Button
            onPress={() => fetchCertificate('intermediate')}
            className="bg-primary-300"
            disabled={certLoading}
            variant='solid'
          >
            {certLoading && currentCertType === 'intermediate' ? 'Loading...' : 'View Intermediate CA Certificate'}
          </Button>
          <Button
            onPress={() => fetchCertificate('root')}
            className="bg-primary-300"
            disabled={certLoading}
            variant='solid'
          >
            {certLoading && currentCertType === 'root' ? 'Loading...' : 'View Root CA Certificate'}
          </Button>
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