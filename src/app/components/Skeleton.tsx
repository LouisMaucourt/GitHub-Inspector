import React from 'react';

type SkeletonProps = {
    lines?: number;
    height?: string;
    width?: string;
    maxWidth?: string;
};

const Skeleton: React.FC<SkeletonProps> = ({
    lines = 20,
    height = '16px',
    width = '100%',
    maxWidth = '1000px',
}) => (
    <ul>
        {Array.from({ length: lines }).map((_, index) => (
            <li
                key={index}
                className="animate-pulse bg-gray-700 rounded mb-2"
                style={{
                    height,
                    width,
                    maxWidth,
                }}
            ></li>
        ))}
    </ul>
);

export default Skeleton;