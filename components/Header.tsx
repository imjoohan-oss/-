import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-slate-800">우체국택배 배송량 관리</h1>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;