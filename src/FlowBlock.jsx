import React, { useState } from "react";
import * as XLSX from "xlsx";

const statusColor = {
  済: "bg-green-300",
  回答待: "bg-red-300",
};

export default function FlowBlock() {
  const [sheetData, setSheetData] = useState([]); // 全体を保持
  const [nodes, setNodes] = useState([]);
  const [originalSheet, setOriginalSheet] = useState(null); // 書き戻し用

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: true });

      setOriginalSheet(sheet); // 元のシート構造保持
      setSheetData(rows);

      const extracted = rows
        .slice(5) // 6行目以降
        .map((row, i) => {
          const label = row[3]; // D列
          const status = row[1]; // B列
          return label
            ? {
                id: `node-${i}`,
                label,
                status,
                rowIndex: i + 5, // 元データ上の実際の行番号
              }
            : null;
        })
        .filter(Boolean);

      setNodes(extracted);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === id) {
        const newNodes = [...sheetData];
        if (!newNodes[node.rowIndex]) return node;
        newNodes[node.rowIndex][1] = newStatus; // B列に上書き
        setSheetData(newNodes);
        return { ...node, status: newStatus };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const handleExportToExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "工程データ");
    XLSX.writeFile(wb, "更新済_進捗データ.xlsx");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">進捗阻害フロー図（完全Excel連携）</h1>

      <div className="space-x-4">
        <input type="file" onChange={handleFileUpload} accept=".xlsx" />
        <button
          onClick={handleExportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Excelに保存
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-4 rounded-xl shadow-md ${
              statusColor[node.status] || "bg-gray-200"
            } transition-all relative`}
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
