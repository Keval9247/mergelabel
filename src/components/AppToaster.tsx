"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      theme="light"
      richColors
      position="top-right"
      closeButton
    />
  );
}
