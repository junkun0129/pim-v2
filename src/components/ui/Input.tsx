import React, { ReactNode } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: ReactNode;
};

export default function Input({
  label,
  icon,
  id,
  className,
  ...props
}: InputProps) {
  const inputId =
    id ||
    (label ? `input-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  let inputClassName =
    "w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg shadow-sm text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-colors disabled:bg-zinc-50 disabled:text-zinc-500";
  if (icon) {
    inputClassName += " pl-10";
  }
  return (
    <div className={className + " relative"}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      {icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
          {icon}
        </span>
      )}
      <input id={inputId} className={inputClassName} {...props} />
    </div>
  );
}
