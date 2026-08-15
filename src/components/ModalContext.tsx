import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Modal } from "@/src/components/Modal";
import type { ModalType, VariantType } from "@/src/other/types";
import { useTranslation } from "react-i18next";

interface ModalOptions {
  title?: string;
  message: string;
  variant?: VariantType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

interface ModalContextType {
  showAlert: (message: string, variant?: VariantType, title?: string) => void;
  showConfirm: (options: ModalOptions) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("alert");
  const [variant, setVariant] = useState<VariantType>("info");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [confirmText, setConfirmText] = useState<string>("");
  const [cancelText, setCancelText] = useState<string>("");
  const [onConfirmCallback, setOnConfirmCallback] = useState<() => void>(
    () => () => {},
  );

  const showAlert = (
    msg: string,
    varType: VariantType = "info",
    modalTitle?: string,
  ) => {
    setModalType("alert");
    setMessage(msg);
    setVariant(varType);
    setTitle(modalTitle || t("alert_title"));
    setConfirmText(t("ok"));
    setOnConfirmCallback(() => () => {});
    setIsOpen(true);
  };

  const showConfirm = (options: ModalOptions) => {
    setModalType("confirm");
    setMessage(options.message);
    setVariant(options.variant || "warning");
    setTitle(options.title || t("confirm_action_title"));
    setConfirmText(options.confirmText || t("confirm"));
    setCancelText(options.cancelText || t("cancel"));
    setOnConfirmCallback(() => options.onConfirm || (() => {}));
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Modal
        isOpen={isOpen}
        type={modalType}
        variant={variant}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={onConfirmCallback}
        onClose={handleClose}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
