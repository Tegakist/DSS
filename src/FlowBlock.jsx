import React, { useState } from "react";
import * as XLSX from "xlsx";

const statusColor = {
  済: "bg-green-300",
  回答待: "bg-red-300",
};

export default function FlowBlock() {
  const [nodes, setNodes] = useState([]);
  const [fullData, setFullData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const sliced = rows.slice(5); // 6行目以降
      setFullData(sliced);

      const loadedNodes = sliced.map((row, index) => {
        const label = row[3];  // D列
        const status = row[1]; // B列
        return label
          ? {
              id: `node-${index}`,
              label,
              status,
              rowIndex: index, // fullDataとの対応用
            }
          : null;
      }).filter(Boolean);

      setNodes(loadedNodes);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleStatusChange = (id, newStatus) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === id) {
          // fullData にも反映
          const updatedData = [...fullData];
          updatedData[node.rowIndex][1] = newStatus; // B列
          setFullData(updatedData);
          return { ...node, status: newStatus };
        }
        return node;
      })
    );
  };

  const handleExportToExcel = () => {
    const data = [
      ["", "ステータス", "", "標題"], // B列とD列用のヘッダー（仮）
      ...fullData,
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "工程データ");
    XLSX.writeFile(workbook, "更新済_進捗データ.xlsx");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">進捗阻害フロー図（Excel入出力対応）</h1>

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
