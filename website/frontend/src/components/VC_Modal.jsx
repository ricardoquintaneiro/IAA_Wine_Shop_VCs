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

  const loadVerificationData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/credentials/${wine.VC}.json`);
      console.log(`Fetching verification data for VC: ${wine.VC}`);

      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      const data = await response.json();
      setVerificationData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load verification data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && wine && !verificationData) {
      loadVerificationData();
      resetCertificate();
    }
  }, [isOpen, wine]);

  if (!verificationData) return null;

    const handleVerify = () => {
    alert('Verification process initiated! This would connect to blockchain verification service.');
  };

    const handleCertificateRetry = () => {
    fetchCertificate(currentCertType);
  };
  
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