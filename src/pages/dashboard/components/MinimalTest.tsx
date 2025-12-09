/**
 * Minimal test to verify basic React rendering works
 */

import React from 'react';

export function MinimalTest() {
  return (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      padding: '50px',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      border: '10px solid black',
      margin: '20px'
    }}>
      <h1>MINIMAL TEST DASHBOARD</h1>
      <p>If you can see this red box with white text, React is rendering.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <div style={{
        backgroundColor: 'yellow',
        color: 'black',
        padding: '20px',
        marginTop: '20px',
        border: '5px solid blue'
      }}>
        <p>This is a yellow box inside the red box</p>
        <button 
          style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px'
          }}
          onClick={() => alert('Button clicked!')}
        >
          Click Me to Test Interactivity
        </button>
      </div>
    </div>
  );
}
