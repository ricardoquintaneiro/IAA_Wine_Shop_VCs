import { useState, useEffect } from 'react';
import { ImCross } from "react-icons/im";
import { Button } from '@heroui/button';
import { useCertificateManager } from './certificateUtils';
import CertificateModal from './CertificateModal';

export default function VC_Modal({ wine, isOpen, onClose }) {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the certificate manager hook
  const {
    showCert,
    certContent,
    certLoading,
    certError,
    currentCertType,
    fetchCertificate,
    downloadCertificate,
    closeCertificate,
    resetCertificate
  } = useCertificateManager();

  useEffect(() => {
    if (isOpen && wine && !verificationData) {
      loadVerificationData();
      resetCertificate(); // Reset certificate state when modal opens
    }
  }, [isOpen, wine]);

  const loadVerificationData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First, load the mapping file to get the credential filename for this wine
      let mappingResponse;
      try {
        mappingResponse = await fetch('/credentials/wine-credential-mapping.json');
        if (!mappingResponse.ok) {
          throw new Error('Credential mapping file not found');
        }
      } catch (fetchError) {
        console.warn('Could not load credential mapping file, using fallback data');
        setVerificationData(generateFallbackCredential(wine));
        setLoading(false);
        return;
      }
      
      const mapping = await mappingResponse.json();
      
      // Find the credential file for this wine
      // You can use wine.id, wine.name, or any unique identifier
      const credentialFileName = mapping[wine.id] || mapping[`${wine.name}_${wine.vintage}`] || mapping[wine.name];
      
      if (!credentialFileName) {
        console.warn(`No credential mapping found for wine: ${wine.name} (ID: ${wine.id}), using fallback data`);
        setVerificationData(generateFallbackCredential(wine));
        setLoading(false);
        return;
      }
      
      // Load the actual credential file
      let credentialResponse;
      try {
        credentialResponse = await fetch(`/credentials/${credentialFileName}`);
        if (!credentialResponse.ok) {
          throw new Error(`Credential file not found: ${credentialFileName}`);
        }
      } catch (fetchError) {
        console.warn(`Could not load credential file ${credentialFileName}, using fallback data`);
        setVerificationData(generateFallbackCredential(wine));
        setLoading(false);
        return;
      }
      const data = await credentialResponse.json();

      // Validate the credential structure
      if (validateCredentialStructure(data)) {
        setVerificationData(data);
      } else {
        throw new Error('Invalid credential structure');
      }
      
    } catch (error) {
      console.error('Error loading verification data:', error);
      setError(`Failed to load verification data: ${error.message}`);
      // Use fallback data in case of error
      setVerificationData(generateFallbackCredential(wine));
    } finally {
      setLoading(false);
    }
  };

  const validateCredentialStructure = (data) => {
    // Basic validation of the credential structure
    return (
      data &&
      data['@context'] &&
      data.id &&
      data.type &&
      data.issuer &&
      data.credentialSubject &&
      data.proof
    );
  };

  const generateFallbackCredential = (wine) => {
    // Generate fallback data with the new structure
    return {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://example.com/wine-context/v1",
        "https://w3id.org/security/data-integrity/v2"
      ],
      "id": `urn:uuid:${generateUUID()}`,
      "type": [
        "VerifiableCredential",
        "WineCertificationCredential"
      ],
      "issuer": "did:key:zDnaeTVPyhGaA5aDvGqteTqdasjWFmdi7DXDdvobYEdo7Lr9U",
      "issuanceDate": new Date().toISOString(),
      "expirationDate": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      "credentialSubject": {
        "productId": `urn:epc:id:sgln:${Math.random().toString().slice(2, 15)}.${wine.id}`,
        "productName": wine.name,
        "productType": "Wine",
        "wineType": wine.type,
        "origin": {
          "country": wine.region.split(', ')[1] || "Unknown",
          "region": wine.region.split(', ')[0] || wine.region,
          "subRegion": wine.region,
          "producer": {
            "name": `${wine.name.split(' ')[0]} Winery`,
            "did": `did:${wine.name.split(' ')[0].toLowerCase()}-winery`
          }
        },
        "certifications": [
          {
            "certificationType": ["Organic", "Sustainable"],
            "certifyingAuthority": "International Wine Standards",
            "certificateId": `IWS-${wine.id}-${new Date().getFullYear()}`,
            "certificationDate": new Date().toISOString().split('T')[0]
          }
        ],
        "grapeVarieties": getGrapeVarieties(wine.type),
        "alcoholContent": {
          "value": getAlcoholContent(wine.type),
          "unit": "%"
        },
        "volume": {
          "value": 750,
          "unit": "ml"
        },
        "analyticalData": {
          "fixedAcidity": { "value": 7.2, "unit": "g/L" },
          "volatileAcidity": { "value": 0.45, "unit": "g/L" },
          "citricAcid": { "value": 0.32, "unit": "g/L" },
          "residualSugar": { "value": 2.1, "unit": "g/L" },
          "chlorides": { "value": 0.078, "unit": "g/L" },
          "freeSulfurDioxide": { "value": 32, "unit": "mg/L" },
          "totalSulfurDioxide": { "value": 145, "unit": "mg/L" },
          "density": { "value": 0.9965, "unit": "g/cm³" },
          "pH": 3.45,
          "sulphates": { "value": 0.65, "unit": "g/L" }
        },
        "vintage": wine.vintage,
        "batchCode": `BATCH-${wine.id}-${wine.vintage}`
      },
      "proof": {
        "type": "DataIntegrityProof",
        "created": new Date().toISOString(),
        "verificationMethod": "did:key:zDnaeTVPyhGaA5aDvGqteTqdasjWFmdi7DXDdvobYEdo7Lr9U#zDnaeTVPyhGaA5aDvGqteTqdasjWFmdi7DXDdvobYEdo7Lr9U",
        "cryptosuite": "ecdsa-rdfc-2019",
        "proofPurpose": "assertionMethod",
        "proofValue": `z${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
      }
    };
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const getGrapeVarieties = (wineType) => {
    const varieties = {
      "Bordeaux Red": ["Cabernet Sauvignon", "Merlot"],
      "Nebbiolo": ["Nebbiolo"],
      "Champagne": ["Chardonnay", "Pinot Noir"],
      "Cabernet Blend": ["Cabernet Sauvignon", "Merlot", "Cabernet Franc"],
      "Dessert Wine": ["Riesling"],
      "White": ["Alvarinho"],
      "Red": ["Pinot Noir"]
    };
    return varieties[wineType] || ["Pinot Noir"];
  };

  const getAlcoholContent = (wineType) => {
    const alcoholLevels = {
      "Champagne": 12.5,
      "Dessert Wine": 8.5,
      "White": 13,
      "Red": 13.5
    };
    return alcoholLevels[wineType] || 13.5;
  };

  if (!isOpen) return null;

  const handleVerify = () => {
    alert('Verification process initiated! This would connect to blockchain verification service.');
  };

  const handleCertificateRetry = () => {
    fetchCertificate(currentCertType);
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verification data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !verificationData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <ImCross className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Credential</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onPress={() => loadVerificationData()} className="bg-purple-600 text-white">
                Retry
              </Button>
              <Button onPress={onClose} className="bg-gray-200 text-gray-800">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!verificationData) return null;

  // Main verification modal
  return (
    <>
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Wine Verifiable Credential</h2>
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
                <div><strong>Wine Type:</strong> {verificationData.credentialSubject.wineType}</div>
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
                <div><strong>Sub-Region:</strong> {verificationData.credentialSubject.origin.subRegion}</div>
                <div><strong>Producer:</strong> {verificationData.credentialSubject.origin.producer.name}</div>
                <div><strong>Producer DID:</strong> <span className="font-mono text-xs break-all">{verificationData.credentialSubject.origin.producer.did}</span></div>
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
                <div><strong>Issuer:</strong> <span className="font-mono text-xs break-all">{verificationData.issuer}</span></div>
                <div><strong>Issued:</strong> {new Date(verificationData.issuanceDate).toLocaleDateString()}</div>
                <div><strong>Expires:</strong> {new Date(verificationData.expirationDate).toLocaleDateString()}</div>
                <div><strong>Credential ID:</strong> <span className="font-mono text-xs break-all">{verificationData.id}</span></div>
              </div>
            </div>

            {/* Proof */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-purple-600">Digital Proof</h3>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div><strong>Proof Type:</strong> {verificationData.proof.type}</div>
                  <div><strong>Created:</strong> {new Date(verificationData.proof.created).toLocaleDateString()}</div>
                  <div><strong>Cryptosuite:</strong> {verificationData.proof.cryptosuite}</div>
                  <div><strong>Purpose:</strong> {verificationData.proof.proofPurpose}</div>
                </div>
                <div className="mb-2"><strong>Verification Method:</strong> <span className="font-mono text-xs break-all">{verificationData.proof.verificationMethod}</span></div>
                <div><strong>Proof Value:</strong> <span className="font-mono text-xs break-all">{verificationData.proof.proofValue}</span></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
            <Button
              onPress={() => {
                fetchCertificate('intermediate');
              }}
              className="bg-primary-300"
              disabled={certLoading}
              variant='solid'
            >
              {certLoading && currentCertType === 'intermediate' ? 'Loading...' : 'View Intermediate CA Certificate'}
            </Button>
            <Button
              onPress={() => {
                fetchCertificate('root');
              }}
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
              <CertificateModal
        showCert={showCert}
        certContent={certContent}
        certError={certError}
        currentCertType={currentCertType}
        onClose={closeCertificate}
        onDownload={downloadCertificate}
        onRetry={handleCertificateRetry}
      />
      </div>
    </>
  );
}