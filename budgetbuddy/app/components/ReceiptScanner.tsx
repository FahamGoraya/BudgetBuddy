"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";
import { mapVeryfiCategory } from "../lib/data";

interface ParsedReceiptData {
  merchantName: string;
  date: string;
  total: number;
  items: Array<{
    description: string;
    amount: number;
  }>;
  category: string;
  confidence: number;
}

// API response structure from Veryfi
interface ApiReceiptData {
  merchant: string;
  date: string;
  total: number;
  tax: number;
  subtotal: number;
  currency: string;
  lineItems: Array<{
    description: string;
    total?: number;
    quantity?: number;
    price?: number;
  }>;
  rawData: {
    category?: string;
    vendor_type?: string;
    confidence?: number;
    [key: string]: any;
  };
}

// Transform API response to frontend format
const transformApiResponse = (apiData: ApiReceiptData): ParsedReceiptData => {
  // Use vendor_type from Veryfi and map it to our consistent categories
  const veryfiVendorType = apiData.rawData?.vendor_type || apiData.rawData?.category;
  const mappedCategory = mapVeryfiCategory(veryfiVendorType);
  
  return {
    merchantName: apiData.merchant || "Unknown",
    date: apiData.date ? new Date(apiData.date).toLocaleDateString() : "Unknown",
    total: apiData.total || 0,
    items: apiData.lineItems?.map((item) => ({
      description: item.description || "",
      amount: item.total || item.price || 0,
    })) || [],
    category: mappedCategory,
    confidence: apiData.rawData?.confidence || 0.95,
  };
};

interface ReceiptScannerProps {
  onReceiptScanned: (data: ParsedReceiptData) => void;
  onClose: () => void;
}

export default function ReceiptScanner({ onReceiptScanned, onClose }: ReceiptScannerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ParsedReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    setScanResult(null);
    
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process the receipt
    processReceipt(file);
  }, []);

  const processReceipt = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch("/api/receipts/scan", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to process receipt");
      }

      // Transform the API response to match frontend expectations
      const transformedData = transformApiResponse(result.data);
      setScanResult(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process receipt");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleUseResult = () => {
    if (scanResult) {
      onReceiptScanned(scanResult);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setScanResult(null);
    setError(null);
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
      style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-card p-5 md:p-8 w-full sm:max-w-lg relative max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ background: "rgba(18, 18, 26, 0.95)", border: "1px solid rgba(139, 92, 246, 0.2)" }}
        initial={{ scale: 0.9, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 100 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="sm:hidden w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 md:mb-6">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)" }}
          >
            <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Scan Receipt</h2>
            <p className="text-gray-400 text-xs md:text-sm">Take a photo or upload an image</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!selectedImage ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-600 rounded-xl p-6 md:p-8 text-center hover:border-violet-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Drag and drop your receipt here</p>
                <p className="text-gray-500 text-sm">or click to browse files</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-medium text-white"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera className="w-5 h-5" />
                  Take Photo
                </motion.button>
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-medium text-white"
                  style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </motion.button>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                  // Reset input value to allow taking another photo
                  e.target.value = '';
                }}
              />

              <p className="text-gray-500 text-xs text-center">
                Supported formats: JPEG, PNG, WebP • Max size: 10MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Receipt preview"
                  className="w-full h-48 object-cover"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto mb-2" />
                      <p className="text-white font-medium">Processing receipt...</p>
                      <p className="text-gray-400 text-sm">Extracting information</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20"
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <p className="text-rose-300 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Scan Result */}
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Receipt scanned successfully!</span>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Merchant</p>
                        <p className="text-white font-medium">{scanResult.merchantName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Date</p>
                        <p className="text-white font-medium">{scanResult.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Total</p>
                        <p className="text-emerald-400 font-bold text-xl">${scanResult.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Category</p>
                        <p className="text-white font-medium">{scanResult.category}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-gray-500 text-xs">
                        Confidence: {(scanResult.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  onClick={resetScanner}
                  className="flex-1 px-5 py-3 rounded-xl font-medium text-gray-300 transition-all"
                  style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Scan Another
                </motion.button>
                {scanResult && (
                  <motion.button
                    onClick={handleUseResult}
                    className="flex-1 px-5 py-3 rounded-xl font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #10b981 0%, #f59e0b 100%)" }}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Use This Data
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
