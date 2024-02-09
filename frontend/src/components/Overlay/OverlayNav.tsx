import { useState } from 'react';

import './OverlayNav.css';

function Navigation() {
    const [currentPage, setCurrentPage] = useState(1);

    function goToPreviousPage() {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    const totalPages = 10; // Replace 10 with the actual total number of pages

    function goToNextPage() {
        setCurrentPage(currentPage + 1);
    }

    return (
        <nav className="overlay-nav">
            <button onClick={goToPreviousPage}>
                <i aria-hidden>◄</i>Previous
                </button>
            <p>Page {currentPage} out of {totalPages}</p>
            <button onClick={goToNextPage}>
                Next<i aria-hidden>►</i>
                </button>
        </nav>
    );
}

export default Navigation;
