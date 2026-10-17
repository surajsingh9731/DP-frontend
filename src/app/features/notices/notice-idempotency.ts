import { NOTICE_IDEMPOTENCY_PREFIX } from '../../constants/notices.constants';
import { storedActionKey } from '../../core/commands/stored-action-key';
export function noticeActionKey(
  tenantId: string,
  action: string,
  payload: object,
): Promise<string> {
  return storedActionKey(NOTICE_IDEMPOTENCY_PREFIX, tenantId, action, payload);
}
