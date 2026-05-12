import { PageHeader } from '../components/PageHeader';
import { useAppSelector } from '../hooks/useAppSelector';
export function Notifications(){ const notifications=useAppSelector(s=>s.data.notifications); return <><PageHeader title="Notifications" subtitle="Low-stock, procurement, and shipment alerts from RabbitMQ workflows."/><div className="space-y-3">{notifications.map(notification=><div key={notification.id} className="rounded-lg border bg-white p-4 shadow-sm"><div className="font-semibold text-ink">{notification.title}</div><div className="mt-1 text-sm text-steel">{notification.message}</div></div>)}</div></> }

