import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { provisionH3MaxStore } from '../src/shared/services/waffo-provision';

const ENV_PATH = resolve(process.cwd(), '.env.local');

function readEnvFile() {
  if (!existsSync(ENV_PATH)) {
    return '';
  }
  return readFileSync(ENV_PATH, 'utf8');
}

function setEnvLine(env: string, key: string, value: string) {
  const lines = env.split(/\r?\n/);
  const idx = lines.findIndex((line) => {
    const lineKey = line.trim().split(/\s*=/)[0];
    return lineKey === key;
  });
  const line = `${key}=${value}`;

  if (idx >= 0) {
    lines[idx] = line;
  } else {
    lines.push(line);
  }

  return lines.join('\n').replace(/\n+$/, '\n');
}

async function main() {
  const merchantId = process.env.WAFFO_MERCHANT_ID;
  const privateKey = process.env.WAFFO_PRIVATE_KEY;

  if (!merchantId || !privateKey) {
    throw new Error(
      'WAFFO_MERCHANT_ID and WAFFO_PRIVATE_KEY are required to bootstrap provisioning'
    );
  }

  const result = await provisionH3MaxStore({ merchantId, privateKey });
  const productIds = result.products as Record<string, string>;

  let env = readEnvFile();
  env = setEnvLine(env, 'WAFFO_MERCHANT_ID', merchantId);
  env = setEnvLine(env, 'WAFFO_PRIVATE_KEY', result.prodPrivateKey || privateKey);
  env = setEnvLine(env, 'WAFFO_STORE_ID', result.storeId);
  env = setEnvLine(env, 'WAFFO_PRODUCT_IDS', JSON.stringify(productIds));
  env = setEnvLine(env, 'WAFFO_ENVIRONMENT', 'prod');
  writeFileSync(ENV_PATH, env);

  console.log(
    JSON.stringify(
      {
        storeId: result.storeId,
        products: productIds,
        wroteEnvFile: ENV_PATH,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
