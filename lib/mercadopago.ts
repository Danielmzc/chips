import { MercadoPagoConfig, Payment } from "mercadopago";

export class MercadoPagoNotConfiguredError extends Error {
  constructor() {
    super("MERCADOPAGO_ACCESS_TOKEN não configurado.");
    this.name = "MercadoPagoNotConfiguredError";
  }
}

function getClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new MercadoPagoNotConfiguredError();
  }
  return new MercadoPagoConfig({ accessToken });
}

type CreatePixParams = {
  orderId: string;
  amountCents: number;
  customerName: string;
  customerEmail?: string;
};

export async function createPixPayment({
  orderId,
  amountCents,
  customerName,
  customerEmail,
}: CreatePixParams) {
  const client = getClient();
  const payment = new Payment(client);

  const [firstName, ...rest] = customerName.trim().split(" ");
  const lastName = rest.join(" ") || firstName;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const result = await payment.create({
    body: {
      transaction_amount: Number((amountCents / 100).toFixed(2)),
      description: `Pedido ${orderId}`,
      payment_method_id: "pix",
      external_reference: orderId,
      notification_url: baseUrl
        ? `${baseUrl}/api/webhooks/mercadopago`
        : undefined,
      payer: {
        email: customerEmail || "cliente@exemplo.com",
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  const transactionData = result.point_of_interaction?.transaction_data;

  return {
    paymentId: String(result.id),
    qrCodeBase64: transactionData?.qr_code_base64 ?? null,
    copyPaste: transactionData?.qr_code ?? null,
  };
}

export async function getPayment(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
