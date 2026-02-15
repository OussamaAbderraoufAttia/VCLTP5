import React from 'react';

function Success() {
    return (
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
            <h1 style={{ color: '#28a745' }}>Login Successful!</h1>
            <p style={{ fontSize: '1.2em' }}>Welcome back! You have successfully authenticated.</p>
            <div style={{ marginTop: '20px', fontSize: '3em' }}>🎉</div>
        </div>
    );
}

export default Success;
