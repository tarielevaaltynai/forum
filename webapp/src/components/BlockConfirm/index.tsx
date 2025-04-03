import React from "react";
import { Button } from "../../components/Button";
import styles from "./index.module.scss";

interface BlockConfirmProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export const BlockConfirm: React.FC<BlockConfirmProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Подтверждение",
  message = "Вы уверены?",
  confirmText = "Да",
  cancelText = "Нет",
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          <Button color="red" onClick={onConfirm}>
            {confirmText}
          </Button>
          <Button color="gray" onClick={onCancel}>
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};
