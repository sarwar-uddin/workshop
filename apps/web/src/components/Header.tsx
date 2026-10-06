type HeaderProps = {
  userName: string
}

function Header({ userName }: HeaderProps) {
  return (
    <header>
      <h1>Workshop</h1>
      <p>Welcome, {userName}</p>
    </header>
  )
}

export default Header
