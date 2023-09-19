import React from 'react';

interface GradientButtonProps {
    label: string;
    buttonLabel: string;  // assuming it can be 'Not Started' or 'XX%'
}

const GradientButton: React.FC<GradientButtonProps> = ({ label, buttonLabel }) => {

    const isProgress = buttonLabel.includes('%');
    const progress = buttonLabel.includes('%') ? parseInt(buttonLabel.split('%')[0]) : 0;

    return (
        <>
            <label
                htmlFor={`${label}Picker`}
                className={`w-[100px] text-center rounded-lg py-2 px-4 relative overflow-hidden text-black
                            ${!isProgress ? 'bg-gray-500' : ''}`}
            >
                {/* Visualize progress on the button*/}
                {isProgress && (
                    <>
                        {/* Base color */}
                        <div className="absolute inset-0 bg-gray-500"></div>

                        {/* Progress color */}
                        <div
                            className="absolute inset-0 bg-yellow-400"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </>
                )}

                {/* Text on top */}
                <span className="relative z-10">
                    {buttonLabel}
                </span>
            </label>

            <button
                id={`${label}Picker`}
                className={`relative overflow-hidden`}
                disabled={true}
            >
            </button>
        </>
    );
};

export default GradientButton;
