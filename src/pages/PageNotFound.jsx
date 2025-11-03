import React from 'react'
import { useNavigate } from 'react-router-dom'

function PageNotFound() {
    const navigete = useNavigate();
  return (
    <div>
      <h1>404 Page not found</h1>
      <button onClick={() => navigete("/login")}>login</button>
    </div>
  )
}

export default PageNotFound
