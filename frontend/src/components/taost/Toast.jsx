import { useState, useEffect } from "react"; // ✅ useState manquait
import { Check, XCircle, X } from "lucide-react";

export function Toast({ show, message, type, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const isSuccess = type === "success";

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      left: "24px",
      zIndex: 9999,
      transform: visible ? "translateX(0)" : "translateX(-120%)",
      opacity: visible ? 1 : 0,
      transition: "transform 0.4s ease, opacity 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 16px",
      borderRadius: "10px",
      background: isSuccess ? "#dcfce7" : "#fee2e2",
      border: `1px solid ${isSuccess ? "#86efac" : "#fca5a5"}`,
      color: isSuccess ? "#15803d" : "#b91c1c",
      fontWeight: 500,
      fontSize: "14px",
      minWidth: "240px",
      maxWidth: "340px",
    }}>
      <span>{isSuccess ? <Check /> : <XCircle />}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex" }}
      >
        <X size={14} />
      </button>
    </div>
  );
}