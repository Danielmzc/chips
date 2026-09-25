"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatBRL } from "@/lib/format";
import { Header } from "@/components/Header";

type CheckoutResponse = {
  orderId: string;
  totalCents: number;
  pix: { qrCodeBase64: string | null; copyPaste: string | null } | null;
  warning?: string;
  error?: string;
};

export default function CarrinhoPage() {
  const { items, setQuantity, removeItem, totalCents, clear } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<"LOCAL" | "CARRIER">("LOCAL");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          deliveryMethod,
          address: deliveryMethod === "CARRIER" ? address : undefined,
          city: deliveryMethod === "CARRIER" ? city : undefined,
          state: deliveryMethod === "CARRIER" ? state : undefined,
          zipCode: deliveryMethod === "CARRIER" ? zipCode : undefined,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data: CheckoutResponse = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao finalizar o pedido.");
        return;
      }

      setResult(data);
      clear();
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
            <h1 className="text-xl font-bold text-green-800">Pedido registrado!</h1>
            <p className="mt-1 text-sm text-green-700">
              Pedido #{result.orderId.slice(-8)} — Total: {formatBRL(result.totalCents)}
            </p>
          </div>

          {result.pix?.qrCodeBase64 && (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-white p-6">
              <p className="font-medium">Escaneie o QR Code para pagar via Pix</p>
              <img
                src={`data:image/png;base64,${result.pix.qrCodeBase64}`}
                alt="QR Code Pix"
                className="h-56 w-56"
              />
              {result.pix.copyPaste && (
                <textarea
                  readOnly
                  className="w-full rounded-lg border border-neutral-300 p-2 text-xs"
                  rows={3}
                  value={result.pix.copyPaste}
                />
              )}
            </div>
          )}

          {result.warning && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {result.warning}
            </p>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <h1 className="mb-4 text-xl font-bold">Seu carrinho</h1>

        {items.length === 0 ? (
          <p className="text-neutral-500">Seu carrinho está vazio.</p>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-neutral-500">
                      {item.weight} · {formatBRL(item.priceCents)} un.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="h-7 w-7 rounded-full border border-neutral-300"
                    >
                      −
                    </button>
                    <span className="w-5 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="h-7 w-7 rounded-full border border-neutral-300"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="ml-2 text-sm text-red-500"
                    >
                      remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-right text-lg font-bold">
              Total: {formatBRL(totalCents)}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium">Nome</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Telefone / WhatsApp</label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Entrega</label>
                <div className="mt-1 flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={deliveryMethod === "LOCAL"}
                      onChange={() => setDeliveryMethod("LOCAL")}
                    />
                    Retirada / entrega local
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={deliveryMethod === "CARRIER"}
                      onChange={() => setDeliveryMethod("CARRIER")}
                    />
                    Transportadora
                  </label>
                </div>
              </div>

              {deliveryMethod === "CARRIER" && (
                <div className="space-y-3 rounded-lg bg-amber-50 p-3">
                  <p className="text-xs text-amber-800">
                    Frete via transportadora ainda é combinado manualmente após o pedido.
                  </p>
                  <input
                    required
                    placeholder="Endereço completo"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 p-2"
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="Cidade"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 p-2"
                    />
                    <input
                      placeholder="UF"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-20 rounded-lg border border-neutral-300 p-2"
                    />
                    <input
                      placeholder="CEP"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-32 rounded-lg border border-neutral-300 p-2"
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-amber-500 py-3 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Finalizar pedido"}
              </button>
            </form>
          </>
        )}
      </main>
    </>
  );
}
