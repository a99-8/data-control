import React from "react";
import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import type { ModalProps } from "@/src/types";
import { useTranslation } from "react-i18next";

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  type = "alert",
  variant = "info",
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const defaultConfirmText = confirmText || t("confirm");
  const defaultCancelText = cancelText || t("cancel");

  const renderIcon = () => {
    switch (variant) {
      case "success":
        return (
          <CheckCircle2
            size={44}
            style={{ color: "var(--accent)" }}
            className="mb-2"
          />
        );
      case "danger":
        return (
          <XCircle
            size={44}
            style={{ color: "var(--danger)" }}
            className="mb-2"
          />
        );
      case "warning":
        return (
          <AlertTriangle
            size={44}
            style={{ color: "var(--amber)" }}
            className="mb-2"
          />
        );
      default:
        return (
          <Info
            size={44}
            style={{ color: "var(--accent-2)" }}
            className="mb-2"
          />
        );
    }
  };

  const getConfirmBtnStyle = () => {
    switch (variant) {
      case "danger":
        return {
          backgroundColor: "var(--danger)",
          borderColor: "var(--danger)",
          color: "#fff",
        };
      case "warning":
        return {
          backgroundColor: "var(--amber)",
          borderColor: "var(--amber)",
          color: "#000",
        };
      case "success":
        return {
          backgroundColor: "var(--accent)",
          borderColor: "var(--accent)",
          color: "var(--bg-deep)",
        };
      default:
        return {
          backgroundColor: "var(--accent-2)",
          borderColor: "var(--accent-2)",
          color: "#fff",
        };
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            backgroundColor: "var(--bg-panel)",
            color: "var(--text)",
            border: "1px solid var(--line-strong)",
            borderRadius: "12px",
          }}
        >
          <div className="modal-header border-0 pb-0 d-flex align-items-center justify-content-between w-100">
            <h5
              className="modal-title fw-bold m-0"
              style={{ color: "var(--text)" }}
            >
              {title || ""}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white m-0"
              onClick={onClose}
              aria-label={t("close")}
              style={{ opacity: 0.8 }}
            ></button>
          </div>

          <div className="modal-body text-center py-4">
            {renderIcon()}
            <p
              className="fs-6 mb-0"
              style={{ color: "var(--text-dim)", lineHeight: 1.6 }}
            >
              {message}
            </p>
          </div>

          <div className="modal-footer border-0 justify-content-center gap-2 pt-0 pb-4">
            {type === "confirm" && (
              <button
                type="button"
                className="btn px-4 fw-bold"
                onClick={onClose}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "var(--line-strong)",
                  color: "var(--text-dim)",
                }}
              >
                {defaultCancelText}
              </button>
            )}
            <button
              type="button"
              className="btn px-4 fw-bold"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={getConfirmBtnStyle()}
            >
              {defaultConfirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
