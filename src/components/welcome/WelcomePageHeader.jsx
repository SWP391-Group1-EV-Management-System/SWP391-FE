import React from 'react'

function WelcomePageHeader() {
    return (
        <>
            <div className="welcomePage-header">
                <div className="welcome-navbar">
                    <img src="/src/assets/images/logo.png" alt="Logo" />
                    <div className="welcome-navbar-links">
                        <a href="#" className="active cursor-target">
                            Home
                        </a>
                        <a href="#" className="cursor-target">About</a>
                        <a href="#" className="cursor-target">Contact</a>
                    </div>
                </div>
            </div>
        </>
    )
}

export default WelcomePageHeader