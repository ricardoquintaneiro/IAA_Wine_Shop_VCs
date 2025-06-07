import { useState } from 'react';

// Custom hook for certificate management
export const useCertificateManager = () => {
  const [showCert, setShowCert] = useState(false);
  const [certContent, setCertContent] = useState('');
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState('');
  const [currentCertType, setCurrentCertType] = useState('');

  const fetchCertificate = async (certificateType) => {
    setCurrentCertType(certificateType);
    
    if (certContent && !certError && currentCertType === certificateType) {
      setShowCert(!showCert);
      return;
    }

    setCertLoading(true);
    setCertError('');
    
    try {
      let response;
      let url;
      if (certificateType === 'intermediate') {
        url = '/issuer.cert.pem';
      } else if (certificateType === 'root') {
        url = '/rootCA.cert.pem';
      } else {
        throw new Error('Invalid certificate type');
      }
      
      response = await fetch(url);
      //console.log('Fetch response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch certificate: ${response.status} ${response.statusText}`);
      }
      
      const content = await response.text();
      
      setCertContent(content);
      setShowCert(true);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      setCertError(`Error loading certificate: ${error.message}`);
      setShowCert(true);
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

  const closeCertificate = () => {
    setShowCert(false);
  };

  const resetCertificate = () => {
    setCertContent('');
    setCertError('');
    setCurrentCertType('');
    setShowCert(false);
  };

  return {
    // State
    showCert,
    certContent,
    certLoading,
    certError,
    currentCertType,
    // Actions
    fetchCertificate,
    downloadCertificate,
    closeCertificate,
    resetCertificate,
    // Setters (if you need direct access)
    setShowCert,
    setCertContent,
    setCertError,
    setCurrentCertType
  };
};