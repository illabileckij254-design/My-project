import React, { useState } from 'react'
import Button from './Button'
import "./styles/App.css"
import  { Counter }  from './Counter';
const App = () => {
  const [count, setCount] = useState(0);
  const handleIncrease = () => {
    setCount(count +1);
  };
  return (
    <div className="app-wrapper">
      <Counter value = {count}/>
      <Button onClick={handleIncrease}/></div>
    
  )
}

export default App