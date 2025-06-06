import { ImCross } from "react-icons/im";
import { Button } from '@heroui/button';

export default function CertificateModal({ 
  showCert, 
  certContent, 
  certError, 
  currentCertType, 
  onClose, 
  onDownload, 
  onRetry 
}) {
  if (!showCert) return null;

  const certTitle = currentCertType === 'intermediate' ? 'Intermediate CA Certificate' : 'Root CA Certificate';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{certTitle}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <ImCross className="w-6 h-6" />
          </button>
        </div>

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

        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-between">
          <Button
            onPress={onClose}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Back to Verification
          </Button>
          <div className="flex gap-2">
            {certContent && !certError && (
              <Button
                onPress={onDownload}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Download Certificate
              </Button>
            )}
            {certError && (
              <Button
                onPress={onRetry}
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