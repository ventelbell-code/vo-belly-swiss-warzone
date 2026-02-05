"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentReported: () => Promise<void>;
  pendingAmount?: number;
}

const USDT_ADDRESS = "TQhRqwKtmwWGoSwZLZazPBRWD4sVFsnRsV";
const PAYPAL_EMAIL = "ventelbell@gmail.com";

export function PaymentModal({
  open,
  onOpenChange,
  pendingAmount = 0,
}: PaymentModalProps) {
  const [copiedUsdt, setCopiedUsdt] = useState(false);
  const [copiedPaypal, setCopiedPaypal] = useState(false);

  const handleCopyUsdt = async () => {
    await navigator.clipboard.writeText(USDT_ADDRESS);
    setCopiedUsdt(true);
    setTimeout(() => setCopiedUsdt(false), 2000);
  };

  const handleCopyPaypal = async () => {
    await navigator.clipboard.writeText(PAYPAL_EMAIL);
    setCopiedPaypal(true);
    setTimeout(() => setCopiedPaypal(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm mx-auto bg-card border-border p-0 gap-0 rounded-lg">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3">
          <DialogTitle className="text-sm sm:text-base font-medium text-foreground">
            Pago del servicio
          </DialogTitle>
        </DialogHeader>

        {/* Pending Amount */}
        <div className="px-4 sm:px-5 pb-3 sm:pb-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Monto pendiente:{" "}
            <span className="font-semibold text-amber-400">
              ${pendingAmount.toFixed(2)} USDT
            </span>
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="usdt" className="w-full">
          <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto p-0">
            <TabsTrigger
              value="usdt"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground py-2 sm:py-2.5 text-[11px] sm:text-xs font-medium"
            >
              USDT TRC20
            </TabsTrigger>
            <TabsTrigger
              value="paypal"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground py-2 sm:py-2.5 text-[11px] sm:text-xs font-medium"
            >
              PayPal
            </TabsTrigger>
          </TabsList>

          {/* USDT Tab */}
          <TabsContent value="usdt" className="mt-0 p-4 sm:p-5 space-y-3 sm:space-y-4">
            {/* QR Code - responsive size */}
            <div className="flex justify-center">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 bg-white rounded">
                <Image
                  src="/images/usdt-qr.jpg"
                  alt="QR USDT TRC20"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* USDT Address with copy */}
            <div className="flex items-center gap-2 bg-muted/30 rounded px-2.5 sm:px-3 py-2">
              <code className="flex-1 text-[9px] sm:text-[10px] text-foreground/80 break-all font-mono leading-relaxed">
                {USDT_ADDRESS}
              </code>
              <button
                onClick={handleCopyUsdt}
                className="shrink-0 p-1.5 sm:p-2 hover:bg-muted rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
              >
                {copiedUsdt ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Discrete note */}
            <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 text-center">
              Solo USDT por red TRON (TRC20)
            </p>
          </TabsContent>

          {/* PayPal Tab */}
          <TabsContent value="paypal" className="mt-0 p-4 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* PayPal Logo */}
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.554 9.488c.121.563.106 1.246-.04 2.016-.582 2.98-2.477 4.466-5.218 4.466h-.372a.678.678 0 0 0-.67.574l-.036.186-.48 3.042-.025.126a.678.678 0 0 1-.67.574H9.39a.41.41 0 0 1-.405-.47l.014-.085.573-3.63.011-.066a.678.678 0 0 1 .67-.574h.468c2.741 0 4.636-1.486 5.218-4.466.146-.77.161-1.453.04-2.016-.04-.19-.095-.362-.164-.52.32.164.586.378.79.632.31.388.49.87.55 1.211z"
                  fill="#009CDE"
                />
                <path
                  d="M18.354 7.932a4.106 4.106 0 0 0-.767-.36 5.946 5.946 0 0 0-.98-.233 8.534 8.534 0 0 0-1.366-.097H10.72a.678.678 0 0 0-.67.574l-.931 5.901-.027.17a.678.678 0 0 1 .67-.574h1.395c2.741 0 4.636-1.486 5.218-4.466.146-.77.161-1.453.04-2.016.383.257.676.61.86 1.04.144.333.22.716.215 1.15l-.136-.089z"
                  fill="#012169"
                />
                <path
                  d="M10.05 7.816a.678.678 0 0 1 .67-.574h4.521c.536 0 1.036.035 1.497.108.132.02.261.045.387.073.253.056.49.126.71.21.26.1.49.22.69.36-.232-1.478-1.278-2.493-2.987-2.493H9.463a.678.678 0 0 0-.67.574L7.01 15.747a.41.41 0 0 0 .405.47h2.644l.663-4.2 1.328-4.2z"
                  fill="#003087"
                />
              </svg>

              {/* Email with copy */}
              <div className="flex-1 flex items-center gap-2 bg-muted/30 rounded px-2.5 sm:px-3 py-2">
                <span className="flex-1 text-[11px] sm:text-xs text-foreground/80 font-mono truncate">
                  {PAYPAL_EMAIL}
                </span>
                <button
                  onClick={handleCopyPaypal}
                  className="shrink-0 p-1.5 sm:p-2 hover:bg-muted rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  {copiedPaypal ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Close Button */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full h-11 sm:h-10 text-xs sm:text-sm bg-transparent"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
