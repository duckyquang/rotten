'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
export default function Home() {
    const [file, setFile] = useState(null);
    const [instructions, setInstructions] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
        setError('');
        setResult(null);
    };
    const handleConvert = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }
        setIsConverting(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('instructions', instructions);
            const response = await fetch('/api/convert', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to convert file');
            }
            const data = await response.json();
            setResult(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
        finally {
            setIsConverting(false);
        }
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-4xl font-bold text-center mb-8", children: "Rotten - Educational Content Brainrot Converter" }), _jsxs("div", { className: "max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-semibold mb-4", children: "Upload Your Document" }), _jsx(FileUpload, { onFileSelect: handleFileSelect }), file && (_jsxs("p", { className: "text-sm text-gray-600 mt-2", children: ["Selected file: ", file.name] }))] }), _jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-semibold mb-4", children: "Customization (Optional)" }), _jsx("textarea", { className: "input-field h-32", placeholder: "Add specific instructions for the conversion (e.g., 'add TikTok slang', 'make it absurdist', 'use dark humor')", value: instructions, onChange: (e) => setInstructions(e.target.value) })] }), _jsx("button", { className: "btn-primary w-full", onClick: handleConvert, disabled: isConverting, children: isConverting ? 'Converting...' : 'Convert to Brainrot' }), error && (_jsx("p", { className: "text-red-500 text-sm mt-4", children: error })), result && (_jsxs("div", { className: "mt-8 space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-2", children: "Student Version" }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsx("p", { className: "whitespace-pre-wrap", children: result.studentVersion }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-2", children: "Teacher Version" }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsx("p", { className: "whitespace-pre-wrap", children: result.teacherVersion }) })] })] }))] })] }));
}
