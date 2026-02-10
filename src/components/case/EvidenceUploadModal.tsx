import { useState, useRef, useCallback } from 'react';
import { Button } from '../ui';
import { X, Upload, FileText, Image, Video, Music, Mail, FileSpreadsheet, File, AlertCircle } from 'lucide-react';
import type { DocumentType } from '../../types';

interface EvidenceUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, documentType: DocumentType) => Promise<void>;
}

const documentTypes: { value: DocumentType; label: string; icon: React.ReactNode }[] = [
    { value: 'document', label: 'Document', icon: <FileText className="w-4 h-4" /> },
    { value: 'image', label: 'Image', icon: <Image className="w-4 h-4" /> },
    { value: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
    { value: 'audio', label: 'Audio', icon: <Music className="w-4 h-4" /> },
    { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { value: 'report', label: 'Report', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { value: 'other', label: 'Other', icon: <File className="w-4 h-4" /> }
];

export function EvidenceUploadModal({ isOpen, onClose, onUpload }: EvidenceUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<DocumentType>('document');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            setSelectedFile(files[0]);
            setError(null);
            // Auto-detect document type based on file extension
            autoDetectType(files[0]);
        }
    }, []);

    const autoDetectType = (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
            setDocumentType('image');
        } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
            setDocumentType('video');
        } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) {
            setDocumentType('audio');
        } else if (['eml', 'msg'].includes(ext || '')) {
            setDocumentType('email');
        } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
            setDocumentType('document');
        } else if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
            setDocumentType('report');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
            setError(null);
            autoDetectType(files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setError(null);

        try {
            await onUpload(selectedFile, documentType);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setDocumentType('document');
        setError(null);
        setIsUploading(false);
        onClose();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Upload Evidence</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                            ${isDragging
                                ? 'border-sky-500 bg-sky-50'
                                : selectedFile
                                    ? 'border-emerald-300 bg-emerald-50'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {selectedFile ? (
                            <div className="space-y-2">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
                                    <FileText className="w-6 h-6 text-emerald-600" />
                                </div>
                                <p className="font-medium text-slate-900">{selectedFile.name}</p>
                                <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                    }}
                                    className="text-sm text-sky-600 hover:text-sky-700 cursor-pointer"
                                >
                                    Choose different file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                                    <Upload className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="font-medium text-slate-700">
                                    Drag & drop a file here
                                </p>
                                <p className="text-sm text-slate-500">
                                    or click to browse
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Document Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Document Type
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {documentTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setDocumentType(type.value)}
                                    className={`
                                        flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all cursor-pointer
                                        ${documentType === type.value
                                            ? 'border-sky-500 bg-sky-50 text-sky-700'
                                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                        }
                                    `}
                                >
                                    {type.icon}
                                    <span className="text-xs font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                    <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                    >
                        {isUploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Upload Evidence
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
