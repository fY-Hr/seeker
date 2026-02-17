import { useState } from "react";
import Nav from "./components/Nav";
import DashboardPage from "./pages/DashboardPage";
import BBoxPage from "./pages/BBoxPage";

function App() {
  const [page, setPage] = useState('')

  function changePage(destination: string): void{
    setPage(destination)
  }

  if(page === '' || page === 'main') return (
    <>
      <Nav redirect={changePage} />
      <DashboardPage />
    </>
  )
  if(page === 'bbox') return (
    <>
      <Nav redirect={changePage} />
      <BBoxPage />
    </>
  )

}

export default App;
