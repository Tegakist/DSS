import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function FlowBlock() {
  const [nodes, setNodes] = useState([]);
  const [workbook, setWorkbook] = useState(null);
  const [sheetName, setSheetName] = useState("");
  const [originalSheet, setOriginalSheet] = useState(null);

  const statusMap = {
    済: "done",
    回答待: "waiting",
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
        .slice(5) // 6行目から
        .map((row, index) => {
          const label = row[3]; // D列
          const statusText = row[1]; // B列
          const status = statusMap[statusText] || "pending";

          return label
            ? {
                id: `node-${index}`,
                label,
                status,
                excelRow: index + 6, // Excel上の行番号
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

    const statusToText = {
      done: "済",
      waiting: "回答待",
      blocked: "差し戻し",
      pending: "未処理",
    };

    nodes.forEach((node) => {
      const statusText = statusToText[node.status] || "";
      const statusCell = "B" + node.excelRow;
      const labelCell = "D" + node.excelRow;
      sheet[statusCell] = { ...(sheet[statusCell] || {}), v: statusText };
      sheet[labelCell] = { ...(sheet[labelCell] || {}), v: node.label };
    });

    workbook.Sheets[sheetName] = sheet;
    XLSX.writeFile(workbook, "updated_data.xlsx");
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
            className="rounded-xl p-4 shadow-md bg-white border"
          >
            <h2 className="text-lg font-bold mb-2">{node.label}</h2>
            <div className="flex gap-2">
              {["done", "waiting", "blocked", "pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(node.id, status)}
                  className={`px-2 py-1 rounded text-sm ${
                    node.status === status
                      ? "bg-black text-white"
                      : "bg-white border"
                  }`}
                >
                  {status === "done"
                    ? "済"
                    : status === "waiting"
                    ? "回答待"
                    : status === "blocked"
                    ? "差し戻し"
                    : "未処理"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
