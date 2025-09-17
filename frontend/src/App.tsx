import './App.css'
import { UserAuth } from './context/AuthContext'

function App() {
  const { session } = UserAuth() || { session: undefined };

  console.log(session);
  return (
    <>
      Home
    </>
  )
}

export default App
