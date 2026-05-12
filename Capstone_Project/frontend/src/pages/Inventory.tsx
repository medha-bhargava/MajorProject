import { PageHeader } from '../components/PageHeader';
import { useAppSelector } from '../hooks/useAppSelector';

export function Inventory(){ const items=useAppSelector(s=>s.data.inventory); return <><PageHeader title="Inventory Management" subtitle="Search stock, monitor quantities, and identify low-stock items."/><div className="overflow-hidden rounded-lg border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-steel"><tr><th className="p-3">SKU</th><th>Name</th><th>Warehouse</th><th>Qty</th><th>Valuation</th></tr></thead><tbody>{items.map(item=><tr className="border-t" key={item.id}><td className="p-3 font-medium">{item.sku}</td><td>{item.name}</td><td>{item.warehouseCode}</td><td className={item.lowStock?'font-semibold text-rose-600':''}>{item.quantity}</td><td>{'$'}{Number(item.valuation).toLocaleString()}</td></tr>)}</tbody></table></div></> }

