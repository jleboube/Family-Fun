import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CheaterModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
}

const CheaterModal: React.FC<CheaterModalProps> = ({ isOpen, onAcknowledge }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce">
        <div className="flex justify-center mb-4">
          <AlertTriangle size={64} className="text-red-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-red-600 mb-2">CAUGHT YOU!</h2>
        <p className="text-gray-800 text-lg font-medium mb-6">
          Trying to sneak a peek at another tab? Not on my watch! 
          <br/><br/>
          <span className="text-sm text-gray-500 italic">This incident has been recorded on your permanent record.</span>
        </p>
        <button
          onClick={onAcknowledge}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
        >
          I Promise To Be Good
        </button>
      </div>
    </div>
  );
};

export default CheaterModal;
