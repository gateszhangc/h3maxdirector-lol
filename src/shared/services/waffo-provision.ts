import { BillingPeriod, TaxCategory, WaffoPancake } from '@waffo/pancake-ts';

export const H3_MAX_STORE_NAME = 'H3 Max';

export type H3MaxBillingPeriod = 'monthly' | 'yearly';

export const H3_MAX_SUBSCRIPTION_PRODUCTS = [
  {
    slug: 'h3max-starter-monthly',
    name: 'H3 Max — Starter Monthly',
    description:
      'Access H3 Max with the Starter monthly plan. Generate cinematic AI video with multimodal context.',
    amount: '9.00',
    billingPeriod: 'monthly',
  },
  {
    slug: 'h3max-pro-monthly',
    name: 'H3 Max — Pro Monthly',
    description:
      'Access H3 Max with the Pro monthly plan. Generate cinematic AI video with native stereo sound and priority processing.',
    amount: '19.00',
    billingPeriod: 'monthly',
  },
  {
    slug: 'h3max-premium-monthly',
    name: 'H3 Max — Premium Monthly',
    description:
      'Access H3 Max with the Premium monthly plan. Generate cinematic AI video at maximum output and priority.',
    amount: '49.00',
    billingPeriod: 'monthly',
  },
  {
    slug: 'h3max-starter-yearly',
    name: 'H3 Max — Starter Yearly',
    description:
      'Access H3 Max with the Starter yearly plan. Generate cinematic AI video with multimodal context.',
    amount: '90.00',
    billingPeriod: 'yearly',
  },
  {
    slug: 'h3max-pro-yearly',
    name: 'H3 Max — Pro Yearly',
    description:
      'Access H3 Max with the Pro yearly plan. Generate cinematic AI video with native stereo sound and priority processing.',
    amount: '190.00',
    billingPeriod: 'yearly',
  },
  {
    slug: 'h3max-premium-yearly',
    name: 'H3 Max — Premium Yearly',
    description:
      'Access H3 Max with the Premium yearly plan. Generate cinematic AI video at maximum output and priority.',
    amount: '490.00',
    billingPeriod: 'yearly',
  },
] as const;

export type H3MaxProductSlug =
  (typeof H3_MAX_SUBSCRIPTION_PRODUCTS)[number]['slug'];

export type H3MaxProductIds = Record<H3MaxProductSlug, string>;

export type WaffoEnvironment = 'test' | 'prod';

export function createWaffoClient({
  merchantId,
  privateKey,
  environment,
}: {
  merchantId: string;
  privateKey: string;
  environment: WaffoEnvironment;
}) {
  return new WaffoPancake({
    merchantId,
    privateKey,
    environment,
  });
}

export async function fetchMerchantApiKeys({
  merchantId,
  privateKey,
  environment = 'prod',
}: {
  merchantId: string;
  privateKey: string;
  environment?: WaffoEnvironment;
}) {
  const client = createWaffoClient({ merchantId, privateKey, environment });

  const result = await client.graphql.query<{
    merchant?: {
      id?: string;
      email?: string;
      apiKeys?: Array<{
        id?: string;
        nickname?: string;
        environment?: string;
        privateKey?: string;
        recentlyUsed?: boolean;
      }>;
    } | null;
  }>({
    query: `query WaffoMerchantApiKeys($id: String!) {
      merchant(id: $id) {
        id
        email
        apiKeys {
          id
          nickname
          environment
          privateKey
          recentlyUsed
        }
      }
    }`,
    variables: { id: merchantId },
  });

  const merchant = result.data?.merchant;
  if (!merchant) {
    throw new Error('Waffo merchant not found');
  }

  const apiKeys = merchant.apiKeys || [];
  const prodKey = apiKeys.find((key) => key.environment === 'prod');
  const testKey = apiKeys.find((key) => key.environment === 'test');

  return {
    merchantId: merchant.id || merchantId,
    email: merchant.email || '',
    apiKeys,
    prodPrivateKey: prodKey?.privateKey || '',
    testPrivateKey: testKey?.privateKey || '',
  };
}

export async function findOrCreateH3MaxStore({
  merchantId,
  privateKey,
}: {
  merchantId: string;
  privateKey: string;
}) {
  const client = createWaffoClient({
    merchantId,
    privateKey,
    environment: 'test',
  });

  const result = await client.graphql.query<{
    stores?: Array<{ id?: string; name?: string }>;
  }>({
    query: `query WaffoStores {
      stores {
        id
        name
      }
    }`,
  });

  const stores = result.data?.stores || [];
  const existing = stores.find(
    (store) => store.name === H3_MAX_STORE_NAME
  );
  if (existing?.id) {
    return existing.id;
  }

  const created = await client.stores.create({ name: H3_MAX_STORE_NAME });
  if (!created.store?.id) {
    throw new Error('Failed to create Waffo H3 Max store');
  }

  return created.store.id;
}

function productPrice(amount: string) {
  return {
    USD: {
      amount,
      taxCategory: TaxCategory.SaaS,
    },
  };
}

export async function syncH3MaxSubscriptionProducts({
  merchantId,
  testPrivateKey,
  prodPrivateKey,
  storeId,
}: {
  merchantId: string;
  testPrivateKey: string;
  prodPrivateKey: string;
  storeId: string;
}) {
  const testClient = createWaffoClient({
    merchantId,
    privateKey: testPrivateKey,
    environment: 'test',
  });
  const prodClient = createWaffoClient({
    merchantId,
    privateKey: prodPrivateKey,
    environment: 'prod',
  });

  const productIds: Record<string, string> = {};

  for (const product of H3_MAX_SUBSCRIPTION_PRODUCTS) {
    const existingResult = await testClient.graphql.query<{
      subscriptionProducts?: Array<{ id?: string; name?: string }>;
    }>({
      query: `query WaffoH3MaxProducts($storeId: String!) {
        subscriptionProducts(storeId: $storeId) {
          id
          name
        }
      }`,
      variables: { storeId },
    });

    const existing = existingResult.data?.subscriptionProducts?.find(
      (item) => item.name === product.name
    );

    const commonParams = {
      storeId,
      name: product.name,
      description: product.description,
      billingPeriod:
        product.billingPeriod === 'yearly'
          ? BillingPeriod.Yearly
          : BillingPeriod.Monthly,
      prices: productPrice(product.amount),
      metadata: {
        slug: product.slug,
      },
    };

    let testProductId = existing?.id || '';

    if (testProductId) {
      await testClient.subscriptionProducts.update({
        id: testProductId,
        ...commonParams,
      });
    } else {
      const created = await testClient.subscriptionProducts.create(commonParams);
      testProductId = created.product?.id || '';
    }

    if (!testProductId) {
      throw new Error(`Failed to create Waffo product: ${product.slug}`);
    }

    const published = await prodClient.subscriptionProducts.publish({
      id: testProductId,
    });
    const prodProductId = published.product?.id || testProductId;

    productIds[product.slug] = prodProductId;
  }

  return productIds as H3MaxProductIds;
}

export async function provisionH3MaxStore({
  merchantId,
  privateKey,
}: {
  merchantId: string;
  privateKey: string;
}) {
  const credentials = await fetchMerchantApiKeys({ merchantId, privateKey });
  const testPrivateKey = credentials.testPrivateKey || privateKey;
  const prodPrivateKey = credentials.prodPrivateKey || privateKey;

  const storeId = await findOrCreateH3MaxStore({
    merchantId,
    privateKey: testPrivateKey,
  });

  const productIds = await syncH3MaxSubscriptionProducts({
    merchantId,
    testPrivateKey,
    prodPrivateKey,
    storeId,
  });

  return {
    storeId,
    merchantId,
    products: productIds,
    prodPrivateKey,
    testPrivateKey,
  };
}
