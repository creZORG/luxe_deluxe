
import { getAllOrders, getAllUsers } from "@/lib/admin";
import { getAllProducts } from "@/lib/products";
import DashboardClient from "@/components/admin/dashboard-client";

export default async function DashboardPage() {
    const [orders, products, users] = await Promise.all([
        getAllOrders(),
        getAllProducts(),
        getAllUsers(),
    ]);

    return (
        <DashboardClient orders={orders} products={products} users={users} />
    )
}
