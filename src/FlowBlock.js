import React, { useState } from "react";
import * as XLSX from "xlsx";

const statusColor = {
  done: "bg-green-300",
  waiting: "bg-yellow-200",
  blocked: "bg-red-300",
  pending: "bg-gray-300",
};

export default function FlowBlock() {
  const [nodes, setNodes] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // D列（列番号3）を抽出し、空欄以外をノードに
      const importedNodes = rows
        .slice(1) // ヘッダー行除外
        .map((row, index) => {
          const label = row[3]; // D列
          return label
            ? {
                id: `node-${index}`,
                label: label,
                status: "pending",
              }
            : null;
        })
        .filter(Boolean);

      setNodes(importedNodes);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleStatusChange = (id, newStatus) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, status: newStatus } : node
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Excel読込版：進捗阻害フロー図</h1>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="mb-4"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-4 rounded-xl shadow-md ${statusColor[node.status]} transition-all`}
          >
            <div className="font-semibold text-lg">{node.label}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.keys(statusColor).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(node.id, s)}
                  className={`px-3 py-1 rounded text-sm border ${
                    node.status === s
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
