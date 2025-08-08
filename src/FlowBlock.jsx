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

  const formatExcelDate = (serial) => {
    if (typeof serial !== "number") return serial;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const yyyy = date_info.getFullYear();
    const mm = String(date_info.getMonth() + 1).padStart(2, "0");
    const dd = String(date_info.getDate()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd}`;
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
          const label = row[3];        // D列：標題
          const status = row[1];       // B列：ステータス
          const entryDate = row[2];    // C列：記入日 ← 修正
          const summary = row[4];      // E列：概要
          const questionNo = row[5];   // F列：質疑書No.
          const questionDate = row[6]; // G列：質疑書提出日

          return label
            ? {
                id: `node-${index}`,
                label,
                status,
                entryDate,
                summary,
                questionNo,
                questionDate,
                excelRow: index + 6,
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
      const row = node.excelRow;

      sheet["B" + row] = { v: node.status, t: "s" };
      sheet["D" + row] = { v: node.label, t: "s" };

      // C列：記入日（修正済）
      if (typeof node.entryDate === "number") {
        sheet["C" + row] = {
          v: node.entryDate,
          t: "n",
          z: "yyyy/mm/dd",
        };
      } else {
        sheet["C" + row] = {
          v: node.entryDate || "",
          t: "s",
        };
      }

      // G列：提出日
      if (typeof node.questionDate === "number") {
        sheet["G" + row] = {
          v: node.questionDate,
          t: "n",
          z: "yyyy/mm/dd",
        };
      } else {
        sheet["G" + row] = {
          v: node.questionDate || "",
          t: "s",
        };
      }
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

      <div className="mt-6 grid grid-cols-1 gap-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-4 rounded-xl shadow-md ${
              statusColor[node.status] || "bg-gray-200"
            }`}
          >
            <div className="text-lg font-bold">{node.label}</div>

            <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
              概要：{node.summary || "―"}
            </div>

            <div className="text-sm text-gray-700">
              質疑書No.：{node.questionNo || "―"}
            </div>

            <div className="text-sm text-gray-700">
              提出日：
              {node.questionDate
                ? formatExcelDate(node.questionDate)
                : "―"}
            </div>

            <div className="text-sm text-gray-700 mb-2">
              記入日：
              {node.entryDate
                ? formatExcelDate(node.entryDate)
                : "―"}
            </div>

            <div className="flex gap-2 mt-2">
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
