import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPixPayment, MercadoPagoNotConfiguredError } from "@/lib/mercadopago";

type CheckoutBody = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryMethod: "LOCAL" | "CARRIER";
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  items: { productId: string; quantity: number }[];
};

export async function POST(request: Request) {
  const body: CheckoutBody = await request.json();

  if (!body.customerName || !body.customerPhone) {
    return NextResponse.json(
      { error: "Nome e telefone são obrigatórios." },
      { status: 400 },
    );
  }

  if (!body.items || body.items.length === 0) {
    return NextResponse.json(
      { error: "O carrinho está vazio." },
      { status: 400 },
    );
  }

  if (body.deliveryMethod === "CARRIER" && !body.address) {
    return NextResponse.json(
      { error: "Endereço é obrigatório para entrega via transportadora." },
      { status: 400 },
    );
  }

  const productIds = body.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "Um ou mais produtos não foram encontrados ou estão inativos." },
      { status: 400 },
    );
  }

  const productById = new Map(products.map((product) => [product.id, product]));

  let totalCents = 0;
  const orderItemsData = body.items.map((item) => {
    const product = productById.get(item.productId)!;
    const subtotalCents = product.priceCents * item.quantity;
    totalCents += subtotalCents;

    return {
      productId: product.id,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      subtotalCents,
    };
  });

  // Frete via transportadora ainda não tem tabela definida — combinado manualmente por ora.
  const shippingCents = 0;
  totalCents += shippingCents;

  const order = await prisma.order.create({
    data: {
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      deliveryMethod: body.deliveryMethod,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      shippingCents,
      totalCents,
      items: { create: orderItemsData },
    },
    include: { items: true },
  });

  try {
    const pix = await createPixPayment({
      orderId: order.id,
      amountCents: totalCents,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        pixTxId: pix.paymentId,
        pixQrCode: pix.qrCodeBase64,
        pixCopyPaste: pix.copyPaste,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      totalCents,
      pix: { qrCodeBase64: pix.qrCodeBase64, copyPaste: pix.copyPaste },
    });
  } catch (error) {
    if (error instanceof MercadoPagoNotConfiguredError) {
      return NextResponse.json({
        orderId: order.id,
        totalCents,
        pix: null,
        warning:
          "Pagamento automático via Pix ainda não configurado. O pedido foi registrado e o pagamento será combinado manualmente.",
      });
    }

    console.error("Erro ao criar pagamento Pix:", error);
    return NextResponse.json({
      orderId: order.id,
      totalCents,
      pix: null,
      warning:
        "Pedido registrado, mas houve um erro ao gerar o Pix. Entraremos em contato para combinar o pagamento.",
    });
  }
}
