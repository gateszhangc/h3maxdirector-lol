import {
  Environment,
  verifyWebhook,
  WaffoPancake,
  WebhookEventType,
} from '@waffo/pancake-ts';

import {
  CheckoutSession,
  PaymentConfigs,
  PaymentEvent,
  PaymentEventType,
  PaymentInterval,
  PaymentOrder,
  PaymentProvider,
  PaymentSession,
  PaymentStatus,
  SubscriptionCycleType,
  SubscriptionInfo,
  SubscriptionStatus,
} from './types';

/**
 * Waffo payment provider configs
 * @docs https://pancake.waffo.ai/
 */
export interface WaffoConfigs extends PaymentConfigs {
  merchantId: string;
  privateKey: string;
  environment?: 'test' | 'prod';
}

interface WaffoPriceSnapshot {
  currency?: string;
  subtotal?: string;
  taxAmount?: string;
  total?: string;
  taxCategory?: string;
}

interface WaffoSubscriptionPhaseSnapshot {
  subtotal?: string;
  taxAmount?: string;
  total?: string;
  taxCategory?: string;
}

interface WaffoSubscriptionPriceSnapshot {
  currency?: string;
  regularPhase?: WaffoSubscriptionPhaseSnapshot;
  specialPhase?: WaffoSubscriptionPhaseSnapshot;
  specialPhaseDays?: number;
}

interface WaffoOrderQuery {
  id: string;
  buyerEmail?: string;
  currency?: string;
  status?: string;
  createdAt?: string;
  priceSnapshot?: WaffoPriceSnapshot;
}

interface WaffoSubscriptionOrderQuery extends WaffoOrderQuery {
  billingPeriod?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  priceSnapshot?: WaffoSubscriptionPriceSnapshot;
  subscriptionProduct?: {
    id?: string;
    name?: string;
  };
}

interface WaffoPaymentQuery {
  id: string;
  status?: string;
  orderMerchantExternalId?: string;
  createdAt?: string;
  onetimeOrder?: WaffoOrderQuery;
  subscriptionOrder?: WaffoSubscriptionOrderQuery;
}

interface WaffoPaymentsQueryResult {
  payments: WaffoPaymentQuery[];
}

/**
 * Waffo payment provider implementation
 * @website https://pancake.waffo.ai/
 */
export class WaffoProvider implements PaymentProvider {
  readonly name = 'waffo';
  configs: WaffoConfigs;

  private client: WaffoPancake;

  constructor(configs: WaffoConfigs) {
    this.configs = configs;
    this.client = new WaffoPancake({
      merchantId: configs.merchantId,
      privateKey: configs.privateKey,
      environment:
        configs.environment === 'prod' ? Environment.Prod : Environment.Test,
    });
  }

  // create payment
  async createPayment({
    order,
  }: {
    order: PaymentOrder;
  }): Promise<CheckoutSession> {
    try {
      if (!order.productId) {
        throw new Error('productId is required');
      }
      if (!order.price) {
        throw new Error('price is required');
      }
      if (!order.metadata?.order_no) {
        throw new Error('order_no is required in metadata');
      }

      const buyerIdentity =
        order.customer?.id ||
        order.metadata.user_id ||
        order.customer?.email ||
        '';

      if (!buyerIdentity) {
        throw new Error('buyer identity is required');
      }

      const metadata = this.toStringRecord(order.metadata || {});
      const params = {
        productId: order.productId,
        currency: order.price.currency.toUpperCase(),
        buyerIdentity: String(buyerIdentity),
        buyerEmail: order.customer?.email,
        successUrl: order.successUrl,
        metadata,
        orderMerchantExternalId: String(order.metadata.order_no),
      };

      const result = await this.client.checkout.authenticated.create(params);

      return {
        provider: this.name,
        checkoutParams: params,
        checkoutInfo: {
          // Waffo does not expose a retrieve-by-checkout-session API. Store the
          // local order_no as the session id so the callback route can query
          // Waffo by orderMerchantExternalId.
          sessionId: String(order.metadata.order_no),
          checkoutUrl: result.checkoutUrl,
        },
        checkoutResult: result,
        metadata,
      };
    } catch (error) {
      throw error;
    }
  }

  // get payment by local order_no, which is stored as orderMerchantExternalId
  async getPaymentSession({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<PaymentSession> {
    try {
      const result = await this.client.graphql.query<WaffoPaymentsQueryResult>({
        query: `query WaffoPaymentByOrderNo($ref: String!) {
          payments(filter: { orderMerchantExternalId: { eq: $ref } }) {
            id
            status
            orderMerchantExternalId
            createdAt
            onetimeOrder {
              id
              buyerEmail
              currency
              status
              createdAt
              priceSnapshot {
                currency
                subtotal
                taxAmount
                total
                taxCategory
              }
            }
            subscriptionOrder {
              id
              buyerEmail
              status
              billingPeriod
              currentPeriodStart
              currentPeriodEnd
              createdAt
              subscriptionProduct {
                id
                name
              }
              priceSnapshot {
                currency
                regularPhase {
                  subtotal
                  taxAmount
                  total
                  taxCategory
                }
                specialPhase {
                  subtotal
                  taxAmount
                  total
                  taxCategory
                }
                specialPhaseDays
              }
            }
          }
        }`,
        variables: { ref: sessionId },
      });

      const payments = result.data?.payments || [];
      const payment =
        payments.find((item) => item.status === 'succeeded') || payments[0];

      if (!payment) {
        throw new Error('payment not found');
      }

      if (payment.subscriptionOrder) {
        return this.buildPaymentSessionFromSubscriptionQuery(
          payment,
          payment.subscriptionOrder
        );
      }

      if (payment.onetimeOrder) {
        return this.buildPaymentSessionFromOnetimeQuery(
          payment,
          payment.onetimeOrder
        );
      }

      throw new Error('invalid Waffo payment query result');
    } catch (error) {
      throw error;
    }
  }

  // get payment event from webhook notification
  async getPaymentEvent({ req }: { req: Request }): Promise<PaymentEvent> {
    try {
      const rawBody = await req.text();
      const signature = req.headers.get('x-waffo-signature');

      if (!rawBody || !signature) {
        throw new Error('Invalid webhook request');
      }

      const event = verifyWebhook(rawBody, signature, {
        environment: this.configs.environment,
      });

      const eventType = this.mapWaffoEventType(event.eventType);

      return {
        eventType,
        eventResult: event,
        paymentSession: this.buildPaymentSessionFromWaffoWebhook(event),
      };
    } catch (error) {
      throw error;
    }
  }

  // cancel subscription
  async cancelSubscription({
    subscriptionId,
  }: {
    subscriptionId: string;
  }): Promise<PaymentSession> {
    try {
      const result = await this.client.orders.cancelSubscription({
        orderId: subscriptionId,
      });

      if (!result.orderId) {
        throw new Error('cancel subscription failed');
      }

      return {
        provider: this.name,
        subscriptionId: result.orderId,
      };
    } catch (error) {
      throw error;
    }
  }

  private mapWaffoEventType(eventType: string): PaymentEventType {
    switch (eventType) {
      case WebhookEventType.OrderCompleted:
        return PaymentEventType.CHECKOUT_SUCCESS;
      case WebhookEventType.SubscriptionActivated:
        return PaymentEventType.CHECKOUT_SUCCESS;
      case WebhookEventType.SubscriptionPaymentSucceeded:
        return PaymentEventType.PAYMENT_SUCCESS;
      case WebhookEventType.SubscriptionCanceling:
      case WebhookEventType.SubscriptionUncanceled:
      case WebhookEventType.SubscriptionUpdated:
      case WebhookEventType.SubscriptionPastDue:
        return PaymentEventType.SUBSCRIBE_UPDATED;
      case WebhookEventType.SubscriptionCanceled:
        return PaymentEventType.SUBSCRIBE_CANCELED;
      case WebhookEventType.RefundSucceeded:
      case WebhookEventType.RefundFailed:
        return PaymentEventType.PAYMENT_REFUNDED;
      default:
        throw new Error(`Not handle Waffo event type: ${eventType}`);
    }
  }

  private buildPaymentSessionFromWaffoWebhook(event: any): PaymentSession {
    const data = event.data;
    const metadata = {
      ...(data.orderMetadata || {}),
      order_no: data.orderMerchantExternalId || data.orderMetadata?.order_no,
    };

    const paymentSession: PaymentSession = {
      provider: this.name,
      paymentStatus: this.mapWaffoPaymentStatus(event.eventType, data),
      paymentResult: event,
      metadata,
    };

    if (event.eventType === WebhookEventType.OrderCompleted) {
      paymentSession.paymentInfo = this.buildPaymentInfoFromWebhook(
        event,
        data
      );
      return paymentSession;
    }

    if (event.eventType === WebhookEventType.SubscriptionActivated) {
      paymentSession.paymentInfo = this.buildPaymentInfoFromWebhook(
        event,
        data,
        {
          subscriptionCycleType: SubscriptionCycleType.CREATE,
        }
      );
      paymentSession.subscriptionId = data.orderId;
      paymentSession.subscriptionInfo =
        this.buildSubscriptionInfoFromWebhook(data);
      paymentSession.subscriptionResult = data;
      return paymentSession;
    }

    if (event.eventType === WebhookEventType.SubscriptionPaymentSucceeded) {
      paymentSession.paymentInfo = this.buildPaymentInfoFromWebhook(
        event,
        data,
        {
          subscriptionCycleType: SubscriptionCycleType.RENEWAL,
        }
      );
      paymentSession.subscriptionId = data.orderId;
      paymentSession.subscriptionInfo =
        this.buildSubscriptionInfoFromWebhook(data);
      paymentSession.subscriptionResult = data;
      return paymentSession;
    }

    if (
      event.eventType === WebhookEventType.SubscriptionCanceling ||
      event.eventType === WebhookEventType.SubscriptionUncanceled ||
      event.eventType === WebhookEventType.SubscriptionUpdated ||
      event.eventType === WebhookEventType.SubscriptionPastDue ||
      event.eventType === WebhookEventType.SubscriptionCanceled
    ) {
      paymentSession.subscriptionId = data.orderId;
      paymentSession.subscriptionInfo =
        this.buildSubscriptionInfoFromWebhook(data);
      paymentSession.subscriptionResult = data;
      return paymentSession;
    }

    // refund events are intentionally ignored by the notify route, but we
    // still return a minimal session so Waffo does not retry them.
    return paymentSession;
  }

  private buildPaymentInfoFromWebhook(
    event: any,
    data: any,
    extra?: {
      subscriptionCycleType?: SubscriptionCycleType;
    }
  ) {
    const currency = (data.currency || '').toUpperCase();
    const amount = this.toMinorUnits(data.total || data.amount, currency);

    return {
      transactionId: data.paymentId || event.eventId,
      amount,
      currency,
      paymentAmount: amount,
      paymentCurrency: currency,
      paymentEmail: data.buyerEmail,
      paidAt: data.paymentDate ? new Date(data.paymentDate) : undefined,
      subscriptionCycleType: extra?.subscriptionCycleType,
    };
  }

  private buildSubscriptionInfoFromWebhook(data: any): SubscriptionInfo {
    const currency = (data.currency || '').toUpperCase();
    const { interval, intervalCount } = this.mapBillingPeriod(
      data.billingPeriod
    );

    return {
      subscriptionId: data.orderId,
      productId: undefined,
      description: data.productDescription || data.productName || '',
      amount: this.toMinorUnits(data.total || data.amount, currency),
      currency,
      interval,
      intervalCount,
      currentPeriodStart: data.currentPeriodStart
        ? new Date(data.currentPeriodStart)
        : new Date(),
      currentPeriodEnd: data.currentPeriodEnd
        ? new Date(data.currentPeriodEnd)
        : new Date(),
      billingUrl: undefined,
      metadata: data.orderMetadata,
      status: this.mapWaffoSubscriptionStatus(data.orderStatus),
      canceledAt: data.canceledAt ? new Date(data.canceledAt) : undefined,
    };
  }

  private buildPaymentSessionFromOnetimeQuery(
    payment: WaffoPaymentQuery,
    order: WaffoOrderQuery
  ): PaymentSession {
    const currency = (order.currency || '').toUpperCase();
    const amount = this.toMinorUnits(order.priceSnapshot?.total, currency);

    return {
      provider: this.name,
      paymentStatus: PaymentStatus.SUCCESS,
      paymentInfo: {
        transactionId: payment.id,
        amount,
        currency,
        paymentAmount: amount,
        paymentCurrency: currency,
        paymentEmail: order.buyerEmail,
        paidAt: payment.createdAt ? new Date(payment.createdAt) : undefined,
      },
      paymentResult: payment,
      metadata: {
        order_no: payment.orderMerchantExternalId || '',
      },
    };
  }

  private buildPaymentSessionFromSubscriptionQuery(
    payment: WaffoPaymentQuery,
    order: WaffoSubscriptionOrderQuery
  ): PaymentSession {
    const currency = (
      order.priceSnapshot?.currency ||
      order.currency ||
      ''
    ).toUpperCase();
    const price =
      order.priceSnapshot?.regularPhase || order.priceSnapshot?.specialPhase;
    const amount = this.toMinorUnits(price?.total, currency);

    const subscriptionInfo: SubscriptionInfo = {
      subscriptionId: order.id,
      productId: order.subscriptionProduct?.id,
      description: order.subscriptionProduct?.name || '',
      amount,
      currency,
      interval: this.mapBillingPeriod(order.billingPeriod).interval,
      intervalCount: this.mapBillingPeriod(order.billingPeriod).intervalCount,
      currentPeriodStart: order.currentPeriodStart
        ? new Date(order.currentPeriodStart)
        : new Date(),
      currentPeriodEnd: order.currentPeriodEnd
        ? new Date(order.currentPeriodEnd)
        : new Date(),
      billingUrl: undefined,
      metadata: undefined,
      status: this.mapWaffoSubscriptionStatus(order.status),
    };

    return {
      provider: this.name,
      paymentStatus: PaymentStatus.SUCCESS,
      paymentInfo: {
        transactionId: payment.id,
        amount,
        currency,
        paymentAmount: amount,
        paymentCurrency: currency,
        paymentEmail: order.buyerEmail,
        paidAt: payment.createdAt ? new Date(payment.createdAt) : undefined,
        subscriptionCycleType: SubscriptionCycleType.CREATE,
      },
      paymentResult: payment,
      subscriptionId: order.id,
      subscriptionInfo,
      subscriptionResult: order,
      metadata: {
        order_no: payment.orderMerchantExternalId || '',
      },
    };
  }

  private mapWaffoPaymentStatus(
    eventType: string,
    data: any
  ): PaymentStatus | undefined {
    if (
      eventType === WebhookEventType.OrderCompleted ||
      eventType === WebhookEventType.SubscriptionActivated ||
      eventType === WebhookEventType.SubscriptionPaymentSucceeded
    ) {
      return PaymentStatus.SUCCESS;
    }

    if (
      eventType === WebhookEventType.RefundSucceeded ||
      eventType === WebhookEventType.RefundFailed
    ) {
      return data.refundStatus === 'succeeded'
        ? PaymentStatus.SUCCESS
        : PaymentStatus.FAILED;
    }

    return undefined;
  }

  private mapWaffoSubscriptionStatus(status?: string): SubscriptionStatus {
    switch (status) {
      case 'active':
      case 'pending':
        return SubscriptionStatus.ACTIVE;
      case 'canceling':
        return SubscriptionStatus.PENDING_CANCEL;
      case 'canceled':
      case 'closed':
        return SubscriptionStatus.CANCELED;
      case 'past_due':
      case 'expired':
        return SubscriptionStatus.EXPIRED;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }

  private mapBillingPeriod(billingPeriod?: string): {
    interval: PaymentInterval;
    intervalCount: number;
  } {
    switch (billingPeriod) {
      case 'weekly':
        return { interval: PaymentInterval.WEEK, intervalCount: 1 };
      case 'monthly':
        return { interval: PaymentInterval.MONTH, intervalCount: 1 };
      case 'quarterly':
        return { interval: PaymentInterval.MONTH, intervalCount: 3 };
      case 'yearly':
        return { interval: PaymentInterval.YEAR, intervalCount: 1 };
      default:
        throw new Error(`Unknown Waffo billing period: ${billingPeriod}`);
    }
  }

  private toMinorUnits(
    amount: string | number | undefined,
    currency: string
  ): number {
    if (amount === undefined || amount === null || amount === '') {
      return 0;
    }

    const value = Number(amount);
    if (!Number.isFinite(value)) {
      return 0;
    }

    const upperCurrency = (currency || '').toUpperCase();
    if (['JPY', 'KRW', 'VND'].includes(upperCurrency)) {
      return Math.round(value);
    }

    return Math.round(value * 100);
  }

  private toStringRecord(
    metadata: Record<string, any>
  ): Record<string, string> {
    const result: Record<string, string> = {};

    Object.entries(metadata || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      result[key] = String(value);
    });

    return result;
  }
}

/**
 * Create Waffo provider with configs
 */
export function createWaffoProvider(configs: WaffoConfigs): WaffoProvider {
  return new WaffoProvider(configs);
}
