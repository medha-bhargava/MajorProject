import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useAppSelector } from '../hooks/useAppSelector';
export function Orders(){ const orders=useAppSelector(s=>s.data.orders); return <><PageHeader title="Procurement Orders" subtitle="Track approvals, GRNs, and purchase order lifecycle."/><div className="overflow-hidden rounded-lg border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-steel"><tr><th className="p-3">Item</th><th>SKU</th><th>Qty</th><th>Status</th><th>Unit cost</th></tr></thead><tbody>{orders.map(order=><tr className="border-t" key={order.id}><td className="p-3 font-medium">{order.itemName}</td><td>{order.sku}</td><td>{order.quantity}</td><td><StatusBadge value={order.status}/></td><td>{'$'}{order.unitCost}</td></tr>)}</tbody></table></div></> }

