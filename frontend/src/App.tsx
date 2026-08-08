import './App.css'
import { UserAuth } from './context/AuthContext'

function App() {
  const { session } = UserAuth() || { session: undefined };

  console.log(session);
  return (
    <div className="px-6 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Home</h1>
        <p className="mt-2 text-muted-foreground">Welcome back.</p>
      </div>
    </div>
  )
}

export default App
