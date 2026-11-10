"use client";

import { useState } from "react";
import { IconCheck, IconLink } from "./icons";
import { cn } from "@/lib/utils";

export function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const absolute = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(absolute);
    } catch {
      const input = document.createElement("input");
      input.value = absolute;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn("admin-btn-ghost", className)}
      title={url}
    >
      {copied ? <IconCheck width={16} height={16} /> : <IconLink width={16} height={16} />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
