"use client";

import React from "react";

export type FileUploaderProps = {
  onText: (text: string) => void;
};

export function FileUploader({ onText }: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const text = await file.text();
    onText(text);
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${dragOver ? "bg-blue-50 border-blue-400" : "border-gray-300"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-sm text-gray-600">Drop a CSV here or click to browse</p>
        <p className="mt-2 text-xs text-gray-500">Format: t,a_re,a_im,b_re,b_im,c_re,c_im,d_re,d_im</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
    </div>
  );
}
