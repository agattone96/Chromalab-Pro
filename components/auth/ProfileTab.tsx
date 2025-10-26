import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserLicense } from '../../services/firebaseService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import Tooltip from '../common/Tooltip';
import type { Tab } from '../../types';
import { KeyIcon } from '../icons/KeyIcon';

interface ProfileTabProps {
  setActiveTab: (tab: Tab) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Please upload an image under 5MB.');
        setFile(null);
      } else {
        setFile(selectedFile);
        setError('');
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !currentUser) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await updateUserLicense(currentUser.uid, 'license-placeholder.jpg');
      setSuccess('Your license has been submitted for verification. This can take up to 48 hours. We will notify you via email.');
    } catch (err: any) {
      setError(err.message || 'Failed to upload license.');
    }
    setUploading(false);
  };

  const handlePasskeyRegister = () => {
    alert(
      "Passkey Registration (WebAuthn)\n\n" +
      "This feature is for demonstration purposes.\n\n" +
      "In a production app, this would trigger the browser's passkey creation prompt. A full implementation requires a backend server to handle registration challenges and store public keys securely."
    );
  };

  // DEMO-ONLY FUNCTION
  const handleManualVerify = async () => {
     if (!currentUser) return;
     await updateUserLicense(currentUser.uid, 'license-placeholder.jpg', true);
     alert("You have been manually verified for demo purposes. Please refresh the page.");
     window.location.reload();
  };

  if (!currentUser) {
    return (
      <Card>
        <p>Loading profile...</p>
      </Card>
    );
  }

  const { displayName, email, isVerified } = currentUser;

  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-xl font-bold mb-4">Stylist Profile</h2>
        <div className="space-y-2 text-sm">
          <p><strong className="text-[--color-text-secondary] w-24 inline-block">Name:</strong> {displayName}</p>
          <p><strong className="text-[--color-text-secondary] w-24 inline-block">Email:</strong> {email}</p>
          <p className="flex items-center"><strong className="text-[--color-text-secondary] w-24 inline-block">Status:</strong> 
            {isVerified ? (
              <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-medium">Verified</span>
            ) : (
              <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-medium">Verification Required</span>
            )}
          </p>
        </div>
      </Card>

      {!isVerified && (
        <Card id="license-verification-card">
          <h2 className="text-xl font-bold mb-2">License Verification Required</h2>
          <p className="text-[--color-text-secondary] mb-4 text-sm">
            To access the professional tools (Formula Builder, Simulation Studio, etc.), please upload a clear photo of your cosmetology license.
          </p>
          
          {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
          {success && <p className="bg-green-900/50 text-green-300 p-3 rounded-md mb-4 text-sm">{success}</p>}

          <div className="flex items-center gap-4">
            <input
              type="file"
              id="license-upload"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="license-upload"
              className="cursor-pointer bg-black/20 border border-[--color-border] text-white font-bold py-2 px-4 rounded-md hover:bg-[--color-border] transition-colors"
            >
              Choose File
            </label>
            <span className="text-[--color-text-secondary] text-sm truncate">{file ? file.name : 'No file chosen...'}</span>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full sm:w-auto bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] text-white font-bold py-2 px-6 rounded-md disabled:opacity-50 flex items-center justify-center"
            >
              {uploading ? <Spinner /> : 'Submit for Verification'}
            </button>
             {/* DEMO-ONLY BUTTON */}
             <Tooltip text="For demo purposes, click to instantly verify your account.">
               <button onClick={handleManualVerify} className="text-xs text-[--color-accent-coral] hover:underline">
                 Manual Verify (Demo)
               </button>
            </Tooltip>
          </div>
        </Card>
      )}

       {isVerified && (
        <>
          <Card>
            <h2 className="text-xl font-bold mb-2">You're All Set!</h2>
            <p className="text-[--color-text-secondary] mb-4 text-sm">
              Your license is verified. You have full access to all Chromalab Pro features.
            </p>
            <button onClick={() => setActiveTab('Intake & Analyze')} className="bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] text-white font-bold py-2 px-6 rounded-md">
              Start a New Session
            </button>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-2">Security Settings</h2>
            <p className="text-[--color-text-secondary] mb-4 text-sm">
              Enhance your account security by adding a passkey for passwordless sign-in. This uses WebAuthn for strong, phishing-resistant authentication.
            </p>
            <button
              onClick={handlePasskeyRegister}
              className="w-full sm:w-auto bg-black/20 border border-[--color-border] text-white font-bold py-2 px-6 rounded-md hover:bg-[--color-border] transition-colors flex items-center justify-center"
            >
              <KeyIcon className="w-5 h-5 mr-2" />
              Add a Passkey
            </button>
          </Card>
        </>
      )}

    </div>
  );
};

export default ProfileTab;
