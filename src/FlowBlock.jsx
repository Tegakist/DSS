import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function FlowBlock() {
  const [nodes, setNodes] = useState([]);
  const [workbook, setWorkbook] = useState(null);
  const [sheetName, setSheetName] = useState("");
  const [originalSheet, setOriginalSheet] = useState(null);

  const statusColor = {
    済: "bg-green-300",
    回答待: "bg-red-300",
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const name = wb.SheetNames[0];
      const sheet = wb.Sheets[name];
      setWorkbook(wb);
      setSheetName(name);
      setOriginalSheet({ ...sheet });

      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const importedNodes = rows
        .slice(5)
        .map((row, index) => {
          const label = row[3]; // D列
          const status = row[1]; // B列

          return label
            ? {
                id: `node-${index}`,
                label,
                status,
                excelRow: index + 6, // 実際のExcel上の行番号（6行目から）
              }
            : null;
        })
        .filter(Boolean);

      setNodes(importedNodes);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = nodes.map((node) =>
      node.id === id ? { ...node, status: newStatus } : node
    );
    setNodes(updated);
  };

  const saveToExcel = () => {
    if (!workbook || !sheetName) return;

    const sheet = { ...originalSheet };

    nodes.forEach((node) => {
      const statusCell = "B" + node.excelRow;
      const labelCell = "D" + node.excelRow;
      sheet[statusCell] = { ...(sheet[statusCell] || {}), v: node.status };
      sheet[labelCell] = { ...(sheet[labelCell] || {}), v: node.label };
    });

    workbook.Sheets[sheetName] = sheet;
    XLSX.writeFile(workbook, "更新済_進捗データ.xlsx");
  };

  return (
    <div className="p-4">
      <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" />
      <button
        onClick={saveToExcel}
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Excelに保存
      </button>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-4 rounded-xl shadow-md ${
              statusColor[node.status] || "bg-gray-200"
            }`}
          >
            <h2 className="text-lg font-bold mb-2">{node.label}</h2>
            <div className="flex gap-2">
              {["済", "回答待"].map((s) => (
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
