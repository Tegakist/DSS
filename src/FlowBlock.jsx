import { useState, useEffect } from "react";

const defaultNodes = [
  { id: "A", label: "設計図受領", status: "done" },
  { id: "B", label: "不明点確認", status: "waiting", reason: "設計からの回答待ち" },
  { id: "C", label: "作図開始", status: "blocked", reason: "上流の確認未完了" },
  { id: "D", label: "レビュー提出", status: "pending" },
];

const statusColor = {
  done: "bg-green-300",
  waiting: "bg-yellow-200",
  blocked: "bg-red-300",
  pending: "bg-gray-300",
};

export default function FlowBlock() {
  const [nodes, setNodes] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [newReason, setNewReason] = useState("");

  // 初期化：localStorage から読み込み
  useEffect(() => {
    const stored = localStorage.getItem("nodes");
    if (stored) {
      setNodes(JSON.parse(stored));
    } else {
      setNodes(defaultNodes);
    }
  }, []);

  // 状態変更時に保存
  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes));
  }, [nodes]);

  const handleStatusChange = (id, newStatus) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, status: newStatus } : node
      )
    );
  };

  const handleAddNode = () => {
    if (!newLabel.trim()) return;

    const newNode = {
      id: crypto.randomUUID().slice(0, 6),
      label: newLabel,
      status: "pending",
      reason: newReason || undefined,
    };
    setNodes((prev) => [...prev, newNode]);
    setNewLabel("");
    setNewReason("");
  };

  const handleDeleteNode = (id) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">進捗阻害フロー図（試作）</h1>

      {/* ノード追加フォーム */}
      <div className="space-y-2 p-4 border rounded-lg">
        <input
          type="text"
          placeholder="工程名"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="border px-2 py-1 mr-2"
        />
        <input
          type="text"
          placeholder="理由（任意）"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          className="border px-2 py-1 mr-2"
        />
        <button
          onClick={handleAddNode}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          追加
        </button>
      </div>

      {/* ノード一覧 */}
      <div className="grid md:grid-cols-2 gap-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-4 rounded-xl shadow-md ${statusColor[node.status]} transition-all relative`}
          >
            <div className="font-semibold text-lg">{node.label}</div>
            {node.reason && (
              <div className="text-sm mt-1 text-gray-700">理由：{node.reason}</div>
            )}

            {/* ステータス切り替えボタン */}
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

            {/* 削除ボタン */}
            <button
              onClick={() => handleDeleteNode(node.id)}
              className="absolute top-2 right-2 text-xs text-red-600 hover:underline"
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
