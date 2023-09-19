import React from 'react';
import GradientButton from './gradient-button';

interface FolderPickerProps {
    label: string;
    path: string;
    disabled?: boolean;
    onClick: () => void;
    buttonLabel: string;
}

const FolderPicker = ((props: FolderPickerProps) => {
    const { label, path, disabled, onClick, buttonLabel } = props;

    return (
        <div className="flex justify-between w-full gap-2 p-2 text-[12px]">
            {/* label (parse whenever \n appears) */}
            <div className='items-center w-[20%]'>
                {label.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        {index !== label.split('\n').length - 1 && <br />}
                    </React.Fragment>
                ))}
            </div>

            {/* file path */}
            <div
                className={`flex items-center text-gray-200 bg-gray-700 w-[70%] p-1 rounded-lg
                ${onClick ? 'cursor-pointer text-white' : 'text-gray-400'}`}
                onClick={onClick ? onClick : undefined}>
                {path}
            </div>

            {/* select button */}
            {buttonLabel !== "Select" && (
                GradientButton({ label, buttonLabel })
            )}

            {buttonLabel === "Select" && (
                <>
                    <label
                        htmlFor={`${label}Picker`}
                        className={`w-[100px] text-center rounded-lg py-2 px-4 bg-gray-400
                            ${disabled ? "text-gray-600 cursor-not-allowed" : "text-black cursor-pointer"}`}
                    >
                        {buttonLabel}
                    </label>
                    <button
                        id={`${label}Picker`}
                        disabled={disabled}
                        onClick={onClick || undefined}
                    />
                </>
            )}

        </div >
    );
});

export default FolderPicker;
