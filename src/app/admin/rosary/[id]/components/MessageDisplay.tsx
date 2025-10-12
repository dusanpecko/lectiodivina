"use client";

interface MessageDisplayProps {
  message: string | null;
  messageType: "success" | "error" | null;
  uploadError: string | null;
  clearError: () => void;
}

export default function MessageDisplay({ 
  message, 
  messageType, 
  uploadError, 
  clearError 
}: MessageDisplayProps) {
  if (!message && !uploadError) return null;

  return (
    <div className={`mb-6 p-4 rounded-xl shadow-lg border ${
      messageType === "error" || uploadError
        ? "bg-red-50 border-red-200 text-red-800" 
        : "bg-green-50 border-green-200 text-green-800"
    }`}>
      <div className="flex items-center space-x-2">
        <span className="text-xl">
          {messageType === "error" || uploadError ? "❌" : "✅"}
        </span>
        <span className="font-medium">{message || uploadError}</span>
        {uploadError && (
          <button
            onClick={clearError}
            className="ml-auto p-1 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            <span className="text-red-600">✕</span>
          </button>
        )}
      </div>
    </div>
  );
}