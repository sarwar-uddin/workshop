type DashboardCardProps = {
  title: string
  value: string
  description: string
}

function DashboardCard({
  title,
  value,
  description,
}: DashboardCardProps) {
  return (
    <section>
      <h3>{title}</h3>
      <strong>{value}</strong>
      <p>{description}</p>
    </section>
  )
}

export default DashboardCard
