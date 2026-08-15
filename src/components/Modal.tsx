import React from "react";
import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import type { ModalProps } from "@/src/other/types";
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
        return <CheckCircle2 size={44} className="mb-2 modal-icon-success" />;
      case "danger":
        return <XCircle size={44} className="mb-2 modal-icon-danger" />;
      case "warning":
        return <AlertTriangle size={44} className="mb-2 modal-icon-warning" />;
      default:
        return <Info size={44} className="mb-2 modal-icon-info" />;
    }
  };

  const getConfirmBtnClass = () => {
    switch (variant) {
      case "danger":
        return "btn-modal-danger";
      case "warning":
        return "btn-modal-warning";
      case "success":
        return "btn-modal-success";
      default:
        return "btn-modal-info";
    }
  };

  return (
    <div
      className="modal fade show d-block modal-backdrop-custom"
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg modal-content-custom">
          <div className="modal-header border-0 pb-0 d-flex align-items-center justify-content-between w-100">
            <h5 className="modal-title fw-bold m-0 text-body-custom">
              {title || ""}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white m-0 modal-close-btn"
              onClick={onClose}
              aria-label={t("close")}
            ></button>
          </div>

          <div className="modal-body text-center py-4">
            {renderIcon()}
            <p className="fs-6 mb-0 text-dim-custom modal-message">{message}</p>
          </div>

          <div className="modal-footer border-0 justify-content-center gap-2 pt-0 pb-4">
            {type === "confirm" && (
              <button
                type="button"
                className="btn px-4 fw-bold btn-modal-cancel"
                onClick={onClose}
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
            >
              <span className={`btn px-4 fw-bold ${getConfirmBtnClass()}`}>
                {defaultConfirmText}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
