import { getSignUser } from '@/shared/models/user';
import { PERMISSIONS } from '@/core/rbac/permission';
import { hasPermission } from '@/shared/services/rbac';
import { provisionH3MaxStore } from '@/shared/services/waffo-provision';
import { getAllConfigs } from '@/shared/models/config';
import { respData, respErr } from '@/shared/lib/resp';

export async function POST() {
  try {
    const user = await getSignUser();
    if (!user?.id) {
      return respErr('unauthorized');
    }

    const allowed = await hasPermission(user.id, PERMISSIONS.ADMIN_ACCESS);
    if (!allowed) {
      return respErr('forbidden');
    }

    const configs = await getAllConfigs();
    const merchantId = configs.waffo_merchant_id;
    const privateKey = configs.waffo_private_key;

    if (!merchantId || !privateKey) {
      return respErr('waffo credentials are not configured');
    }

    const result = await provisionH3MaxStore({
      merchantId,
      privateKey,
    });

    return respData(result);
  } catch (error: any) {
    return respErr(error?.message || 'WAFFO_SYNC_FAILED');
  }
}
