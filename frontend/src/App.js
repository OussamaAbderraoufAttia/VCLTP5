import React, { useState } from 'react';
import Login from './Login';
import Success from './Success';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <div className="App">
            {!isLoggedIn ? (
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
            ) : (
                <Success />
            )}
        </div>
    );
}

export default App;
