import { useState } from 'react';
import './App.css';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Counter App</h1>
      <p className="count">{count}</p>
      <div className="buttons">
        <button onClick={() => setCount(count + 1)}>+</button>
        <button onClick={() => setCount(count - 1)}>−</button>
        <button className="reset" onClick={() => setCount(0)}>Reset</button>
      </div>
      <p className="info">Edit this app with Claude Code inside the container</p>
    </div>
  );
}
