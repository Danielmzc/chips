import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mercadopago";

async function handleNotification(paymentId: string | null) {
  if (!paymentId) return;

  const payment = await getPayment(paymentId);
  const orderId = payment.external_reference;

  if (!orderId || payment.status !== "approved") return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID", paidAt: new Date() },
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (!paymentId) {
    const body = await request.json().catch(() => null);
    paymentId = body?.data?.id ?? null;
  }

  try {
    await handleNotification(paymentId);
  } catch (error) {
    console.error("Erro ao processar webhook do Mercado Pago:", error);
  }

  // Mercado Pago espera 200/201 mesmo se a notificação não puder ser processada,
  // para não ficar reenviando indefinidamente.
  return NextResponse.json({ received: true });
}

export async function GET(request: Request) {
  return POST(request);
}
