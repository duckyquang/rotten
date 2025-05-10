import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
export default function FileUpload({ onFileSelect }) {
    const [error, setError] = useState('');
    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file)
            return;
        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a PDF, DOCX, or PPTX file');
            return;
        }
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }
        setError('');
        onFileSelect(file);
    }, [onFileSelect]);
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
        },
        maxFiles: 1,
        noClick: true // Disable click on the dropzone area
    });
    return (_jsxs("div", { className: "w-full", children: [_jsxs("div", { ...getRootProps(), className: `border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`, children: [_jsx("input", { ...getInputProps() }), _jsx("p", { className: "text-gray-600 mb-4", children: isDragActive
                            ? 'Drop the file here'
                            : 'Drag and drop your PDF, DOCX, or PPTX file here' }), _jsx("button", { type: "button", className: "btn-primary", onClick: open, children: "Choose File" })] }), error && (_jsx("p", { className: "text-red-500 text-sm mt-2", children: error }))] }));
}
