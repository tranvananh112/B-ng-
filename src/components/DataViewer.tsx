import React from 'react';

interface DataViewerProps {
  data: any;
  title?: string;
}

export const DataViewer: React.FC<DataViewerProps> = ({ data, title }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {title && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</h3>
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap break-words">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
