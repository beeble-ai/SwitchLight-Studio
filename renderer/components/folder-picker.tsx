import React, { forwardRef, ChangeEvent, Ref, FC } from 'react';

interface FolderPickerProps {
    label: string;
    path: string;
    onClick: () => void;
}

const FolderPicker = forwardRef<HTMLInputElement, FolderPickerProps>((props, ref) => {

    const { label, path, onClick } = props;

    const handleFilePathClick = () => {
        // alert(`You clicked: ${path}`);
    };

    return (
        <div className="flex justify-between w-full gap-2 p-2 text-[12px]">
            {/* label (input video or output video) */}
            <div className='items-center w-[20%]'>{`${label}`}</div>
            {/* file path */}
            <div className='flex items-center text-gray-200 bg-gray-700 w-[70%] p-1 rounded-lg cursor-pointer' onClick={handleFilePathClick}>
                {path}
            </div>

            {/* select button */}
            <label
                htmlFor={`${label}Picker`}
                className="w-[100px] text-center rounded-lg cursor-pointer bg-gray-500 text-white py-2 px-4"
            >
                Select
            </label>
            <button
                id={`${label}Picker`}
                style={{ display: 'none' }}
                onClick={onClick}
            />
        </div>
    );
});

export default FolderPicker;
