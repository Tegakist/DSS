import { useState } from "react";

const initialNodes = [
  { id: "A", label: "設計図受領", status: "done" },
  { id: "B", label: "不明点確認", status: "waiting", reason: "設計からの回答待ち" },
  { id: "C", label: "作図開始", status: "blocked", reason: "上流の確認未完了" },
  { id: "D", label: "レビュー提出", status: "pending" },
];

const statusColor = {
  done: "bg-green-200",
  waiting: "bg-yellow-200",
  blocked: "bg-red-300",
  pending: "bg-gray-200",
};

export default function FlowBlock() {
  const [nodes, setNodes] = useState(initialNodes);

  const handleStatusChange = (id, newStatus) => {
    const updated = nodes.map((node) =>
      node.id === id ? { ...node, status: newStatus } : node
    );
    setNodes(updated);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">進捗阻害フロー図（試作）</h1>
      <div className="grid grid-cols-2 gap-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-4 rounded-xl shadow ${statusColor[node.status]} transition-all`}
          >
            <div className="font-semibold mb-1">{node.label}</div>
            {node.reason && <div className="text-sm">理由：{node.reason}</div>}
            <div className="mt-2 space-x-2">
              {Object.keys(statusColor).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(node.id, s)}
                  className={`px-2 py-1 rounded border ${
                    node.status === s ? "bg-black text-white" : "bg-white"
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
