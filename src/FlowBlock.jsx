import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// ステータスごとの背景色
const statusColor = {
  済: "bg-green-300",
  回答待: "bg-red-300",
};

export default function FlowBlock() {
  const [nodes, setNodes] = useState([]);

  // ローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem("nodes");
    if (saved) {
      setNodes(JSON.parse(saved));
    }
  }, []);

  // ローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes));
  }, [nodes]);

  // ステータス変更
  const handleStatusChange = (id, newStatus) => {
    const updated = nodes.map((node) =>
      node.id === id ? { ...node, status: newStatus } : node
    );
    setNodes(updated);
  };

  // ノード追加
  const handleAdd = () => {
    const label = prompt("工程名を入力してください");
    if (!label) return;
    const newNode = {
      id: `node-${Date.now()}`,
      label,
      status: "回答待",
    };
    setNodes([...nodes, newNode]);
  };

  // ノード削除
  const handleDelete = (id) => {
    if (confirm("この工程を削除しますか？")) {
      setNodes(nodes.filter((node) => node.id !== id));
    }
  };

  // Excel読み込み（B列=ステータス, D列=ラベル, 6行目から）
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const importedNodes = rows
        .slice(5) // 6行目から
        .map((row, index) => {
          const status = row[1]; // B列
          const label = row[3];  // D列
          return label && (status === "済" || status === "回答待")
            ? {
                id: `node-${Date.now()}-${index}`,
                label,
                status,
              }
            : null;
        })
        .filter(Boolean);

      setNodes(importedNodes);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">進捗阻害フロー図（Excel対応版）</h1>

      <div className="space-x-4">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          工程を追加
        </button>
        <input type="file" onChange={handleFileUpload} accept=".xlsx" />
      </div>

      <div className="grid grid-cols-2 gap-4">
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

            <button
              onClick={() => handleDelete(node.id)}
              className="absolute top-1 right-2 text-xs text-red-500"
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
