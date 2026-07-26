import './App.css'
import AuthTest from './components/AuthTest';
import { UserAuth } from './context/AuthContext'

function App() {
  const { session } = UserAuth() || { session: undefined };

  console.log(session);
  return (
    <>
      Home
      <AuthTest></AuthTest>Open Localhost Links
    </>
  )
}

export default App
