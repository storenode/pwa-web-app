import { forwardRef, type InputHTMLAttributes } from "react";

interface FileUploadLabelProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "multiple"> {
  id: string;
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
  /** Allow selecting more than one file at once. Defaults to false (single file). */
  multiple?: boolean;
}

/** Hidden file input styled as a bordered, hover/focus-visible label — used for invoice/document upload triggers. */
const FileUploadLabel = forwardRef<HTMLInputElement, FileUploadLabelProps>(
  (
    {
      id,
      label,
      loadingLabel,
      isLoading = false,
      multiple = false,
      disabled,
      ...inputProps
    },
    ref,
  ) => {
    return (
      <label
        htmlFor={id}
        aria-disabled={isLoading}
        className="block rounded border border-gray-300 p-2 text-gray-900 shadow-sm cursor-pointer transition-colors hover:bg-gray-50 hover:border-gray-400 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-500 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent aria-disabled:hover:border-gray-300"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium">
            {isLoading ? (loadingLabel ?? label) : label}
          </span>

          {isLoading ? (
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="size-4 animate-spin"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
              />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
              />
            </svg>
          )}
        </div>

        <input
          {...inputProps}
          ref={ref}
          type="file"
          id={id}
          multiple={multiple}
          disabled={disabled ?? isLoading}
          className="sr-only"
        />
      </label>
    );
  },
);

FileUploadLabel.displayName = "FileUploadLabel";

export default FileUploadLabel;
