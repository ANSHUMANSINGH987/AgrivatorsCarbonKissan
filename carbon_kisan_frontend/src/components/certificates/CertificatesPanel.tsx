"use client";

import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, Loader, Award, Calendar } from "lucide-react";
import axios from "axios";

interface Certificate {
  certificate_id: string;
  farmer_id: string;
  farm_area_hectares: number;
  estimated_carbon_tonnes: number;
  estimated_value_inr: number;
  timestamp: string;
  location_name: string;
}

interface CertificatesPanelProps {
  farmerId?: string;
  refreshTrigger?: number;
}

export default function CertificatesPanel({ farmerId = "demo_farmer_001", refreshTrigger = 0 }: CertificatesPanelProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [farmerId, refreshTrigger]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/docs/certificates/${farmerId}`
      );
      
      if (response.data.certificates) {
        setCertificates(response.data.certificates);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCert(cert);
    setShowViewer(true);
  };

  const handleDownloadCertificate = async (certId: string) => {
    try {
      setDownloading(certId);
      const response = await axios.get(
        `http://localhost:8000/api/docs/certificate/${certId}/download`,
        { responseType: "blob" }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download certificate");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-dashed border-green-200">
        <FileText className="w-12 h-12 mx-auto text-green-300 mb-3" />
        <p className="text-gray-600">No certificates yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Analyze your farm to generate a carbon certificate
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-800">
          Your Certificates ({certificates.length})
        </h3>
      </div>

      {/* Certificate List */}
      <div className="grid gap-4">
        {certificates.map((cert) => (
          <div
            key={cert.certificate_id}
            className="bg-white border border-green-100 rounded-lg p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {cert.location_name || "Farm Certificate"}
                  </p>
                  <p className="text-sm text-gray-500">{cert.certificate_id}</p>
                </div>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                Verified ✓
              </span>
            </div>

            {/* Metrics Display */}
            <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">Farm Area</p>
                <p className="text-lg font-bold text-green-600">
                  {cert.farm_area_hectares}
                </p>
                <p className="text-xs text-gray-500">hectares</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">Carbon</p>
                <p className="text-lg font-bold text-green-600">
                  {cert.estimated_carbon_tonnes}
                </p>
                <p className="text-xs text-gray-500">tonnes CO₂e</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">Value</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{cert.estimated_value_inr.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">INR</p>
              </div>
            </div>

            {/* Date and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(cert.timestamp).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewCertificate(cert)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleDownloadCertificate(cert.certificate_id)}
                  disabled={downloading === cert.certificate_id}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {downloading === cert.certificate_id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {downloading === cert.certificate_id ? "Downloading..." : "Download"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Viewer Modal */}
      {showViewer && selectedCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Certificate Preview</h3>
              <button
                onClick={() => setShowViewer(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <iframe
              src={`http://localhost:8000/api/docs/certificate/${selectedCert.certificate_id}`}
              className="w-full h-[calc(90vh-80px)]"
              title="Certificate"
            />
          </div>
        </div>
      )}
    </div>
  );
}
