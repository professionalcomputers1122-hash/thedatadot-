"use client";

import React, { useEffect } from "react";

export interface ModernDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  itemType?: string;
  itemName?: string;
  description?: string;
  warningNote?: string;
  confirmButtonText?: string;
  isDeleting?: boolean;
}

export default function ModernDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Permanent Deletion",
  itemType = "Item",
  itemName,
  description,
  warningNote = "This action is irreversible. The record, historical telemetry, and all associated data will be permanently wiped.",
  confirmButtonText = "Permanently Delete",
  isDeleting = false,
}: ModernDeleteModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        if (!isDeleting) onClose();
      }}
    >
      {/* Centered Modal Card */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-b from-[#0f172a] to-[#0b1324] p-6 sm:p-7 text-white shadow-2xl shadow-rose-950/40 animate-in zoom-in-95 duration-200 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full bg-rose-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-44 w-44 rounded-full bg-red-600/10 blur-3xl" />

        {/* Header with Icon & Close */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-inner">
            <svg
              className="h-6 w-6 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:border-slate-700 hover:text-white transition disabled:opacity-40"
            title="Cancel and close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <div className="mt-4 relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400/90 font-mono">
            Destructive Action Required
          </span>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
            {title}
          </h3>
        </div>

        {/* Target Item Highlight */}
        {itemName && (
          <div className="mt-3.5 rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 relative z-10 flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-rose-400 animate-ping shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {itemType} Target
              </span>
              <p className="font-mono text-xs font-bold text-rose-200 truncate">
                {itemName}
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="mt-3 text-slate-300 leading-relaxed relative z-10 text-xs">
          {description ||
            `Are you sure you want to permanently purge this ${itemType.toLowerCase()} from the system? This record will be completely removed.`}
        </p>

        {/* Caution Callout */}
        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-amber-300/90 flex items-start gap-2 relative z-10">
          <span className="text-sm shrink-0">⚠️</span>
          <p className="text-[11px] leading-tight text-amber-200/80">
            {warningNote}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80 relative z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isDeleting}
            className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/50 transition flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Purging Record...</span>
              </>
            ) : (
              <>
                <span>🗑️</span>
                <span>{confirmButtonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
