import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const statusColor = {
  済: "bg-green-300",
  回答待: "bg-red-300",
};

export default function FlowBlock() {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("nodes");
    if (saved) {
      setNodes(JSON.parse(saved));
    } else {
      setNodes([
        { id: "A", label: "設計図受領", status: "済" },
        { id: "B", label: "不明点確認", status: "回答待", reason: "設計からの回答待ち" },
        { id: "C", label: "作図開始", status: "回答待", reason: "上流の確認未完了" },
        { id: "D", label: "レビュー提出", status: "回答待" },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes));
  }, [nodes]);

  const handleStatusChange = (id, newStatus) => {
    const updated = nodes.map((node) =>
      node.id === id ? { ...node, status: newStatus } : node
    );
    setNodes(updated);
  };

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

  const handleDelete = (id) => {
    if (confirm("この工程を削除しますか？")) {
      setNodes(nodes.filter((node) => node.id !== id));
    }
  };

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
        .slice(1)
        .map((row, index) => {
          const label = row[3];
          return label
            ? {
                id: `node-${index}`,
                label,
                status: "回答待",
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
      <h1 className="text-2xl font-bold">進捗阻害フロー図（試作）</h1>

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
            {node.reason && (
              <div className="text-sm mt-1 text-gray-700">理由：{node.reason}</div>
            )}
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
