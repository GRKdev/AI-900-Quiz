'use client'

import { useState, useEffect } from 'react';

const ResetQuiz: React.FC = () => {
    const [shouldReset] = useState(true);

    useEffect(() => {
        if (shouldReset) {
            window.location.href = window.location.href;
        }
    }, [shouldReset]);

    return null;
};

export default ResetQuiz;