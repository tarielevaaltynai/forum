import memoize from "lodash/memoize";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  type CloudinaryUploadPresetName,
  type CloudinaryUploadTypeName,
  getCloudinaryUploadUrl,
} from "@forum_project/shared/src/cloudinary";
import cn from "classnames";
import { type FormikProps } from "formik";
import { trpc } from "../../lib/trpc";
import { Button } from "../Button";
import css from "./index.module.scss";

// Функция для сжатия изображения с улучшенными параметрами
const compressImage = async (
  file: File,
  options: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
    mimeType?: string;
  }
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const { maxWidth, maxHeight, quality, mimeType = "image/webp" } = options;
    const image = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      image.src = event.target?.result as string;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      let width = image.naturalWidth;
      let height = image.naturalHeight;

      // Рассчитываем новые размеры с сохранением пропорций
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      if (ratio < 1) {
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // Улучшенное качество ресайза
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas to Blob failed"));
            return;
          }
          const fileName =
            file.name.replace(/\.[^/.]+$/, "") + "." + mimeType.split("/")[1];
          resolve(
            new File([blob], fileName, {
              type: mimeType,
              lastModified: Date.now(),
            })
          );
        },
        mimeType,
        quality
      );
    };

    image.onerror = (error) => reject(error);
  });
};

export const useUploadToCloudinary = (type: CloudinaryUploadTypeName) => {
  const prepareCloudinaryUpload = trpc.prepareCloudinaryUpload.useMutation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getPreparedData = useCallback(
    memoize(
      async () => {
        const { preparedData } = await prepareCloudinaryUpload.mutateAsync({
          type,
        });
        return preparedData;
      },
      () => JSON.stringify({ type, minutes: new Date().getMinutes() })
    ),
    [type]
  );

  const uploadToCloudinary = async (file: File) => {
    // Оптимальные настройки сжатия
    const compressedFile = await compressImage(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.85,
      mimeType: "image/webp",
    });

    const preparedData = await getPreparedData();

    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("timestamp", preparedData.timestamp);
    formData.append("folder", preparedData.folder);
    formData.append("transformation", preparedData.transformation);
    formData.append("eager", preparedData.eager);
    formData.append("signature", preparedData.signature);
    formData.append("api_key", preparedData.apiKey);

    return fetch(preparedData.url, {
      method: "POST",
      body: formData,
    })
      .then(async (rawRes) => await rawRes.json())
      .then((res) => {
        if (res.error) throw new Error(res.error.message);
        return {
          publicId: res.public_id as string,
          res,
        };
      });
  };

  return { uploadToCloudinary };
};

export const UploadToCloudinary = <TTypeName extends CloudinaryUploadTypeName>({
  label,
  name,
  formik,
  type,
  preset,
  defaultImage, // Добавляем новый пропс
}: {
  label: string;
  name: string;
  formik: FormikProps<any>;
  type: TTypeName;
  preset: CloudinaryUploadPresetName<TTypeName>;
  defaultImage?: string; // Объявляем пропс
}) => {
  const value = formik.values[name];
  const error = formik.errors[name] as string | undefined;
  const touched = formik.touched[name] as boolean;
  const invalid = touched && !!error;
  const disabled = formik.isSubmitting;

  const inputEl = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { uploadToCloudinary } = useUploadToCloudinary(type);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = async (files: FileList | null) => {
    if (!files?.length) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      const file = files[0];
      const { publicId } = await uploadToCloudinary(file);
      await formik.setFieldValue(name, publicId);
      formik.handleSubmit();
    } catch (err: any) {
      console.error("Upload error:", err);
      formik.setFieldError(name, err.message || "Failed to upload image");
    } finally {
      setLoading(false);
      setShowPopup(false);
      setUploadProgress(0);
      if (inputEl.current) inputEl.current.value = "";
    }
  };

  return (
    <div className={cn(css.field, { [css.disabled]: disabled })}>
      <input
        className={css.fileInput}
        type="file"
        disabled={loading || disabled}
        accept="image/*"
        ref={inputEl}
        onChange={({ target: { files } }) => handleFileChange(files)}
      />

      <label className={css.label} htmlFor={name}>
        {label}
      </label>

      {loading && (
        <div className={css.progressBar}>
          <div
            className={css.progressFill}
            style={{ width: `${uploadProgress}%` }}
          />
          <span className={css.progressText}>{uploadProgress}%</span>
        </div>
      )}

      {/* Заменяем существующее условие отображения превью */}
      {!loading && (
        <div className={css.previewContainer}>
          <img
            className={css.preview}
            alt="Preview"
            src={
              value
                ? getCloudinaryUploadUrl(value, type, preset)
                : defaultImage || "" // Используем дефолтное изображение
            }
            onClick={() => setShowPopup(true)}
          />
        </div>
      )}

      {/*       <div className={css.buttons}>
        <Button
          type="button"
          onClick={() => inputEl.current?.click()}
          loading={loading}
          disabled={loading || disabled}
          color="green"
        >
          {value ? "Change Image" : "Upload Image"}
        </Button>


        {!!value && !loading && (
          <Button
            type="button"
            color="red"
            onClick={() => {
              formik.setFieldValue(name, null);
              formik.setFieldError(name, undefined);
              formik.handleSubmit();
            }}
            disabled={disabled}
          >
            Remove Image
          </Button>
        )}
      </div> */}

      {showPopup && (
        <div className={css.popupOverlay}>
          <div ref={overlayRef} className={css.popupContent}>
            <img
              className={css.popupImage}
              src={
                value
                  ? getCloudinaryUploadUrl(value, type, preset)
                  : defaultImage || "" // Используем дефолтное изображение
              }
              alt="Full size preview"
            />
            <div className={css.popupButtons}>
              <Button
                type="button"
                onClick={() => inputEl.current?.click()}
                color="green"
              >
                Изменить
              </Button>
              <Button
                type="button"
                color="red"
                onClick={() => setShowPopup(false)}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}

      {invalid && <div className={css.error}>{error}</div>}
    </div>
  );
};
