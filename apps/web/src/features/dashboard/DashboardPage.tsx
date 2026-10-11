import DashboardCard from './components/DashboardCard'

function DashboardPage() {
  return (
    <>
      <h2>Dashboard</h2>

      <div>
        <DashboardCard
          title="Products"
          value="24"
          description="Demonstration data — not connected to the database."
        />

        <DashboardCard
          title="Customers"
          value="18"
          description="Demonstration data — not connected to the database."
        />

        <DashboardCard
          title="Orders"
          value="7"
          description="Demonstration data — not connected to the database."
        />
      </div>
    </>
  )
}

export default DashboardPage
