import React, { forwardRef, ChangeEvent, Ref, FC } from 'react';

interface FolderPickerProps {
    label: string;
    path: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const FolderPicker = forwardRef<HTMLInputElement, FolderPickerProps>((props, ref) => {

    const { label, path, onChange } = props;

    return (
        <div className="flex justify-between w-[50%]">
            <div>{`${label}: ${path}`}</div>
            <label
                htmlFor={`${label}Picker`}
                className="w-[100px] cursor-pointer bg-gray-500 text-white py-2 px-4 rounded text-center"
            >
                Select
            </label>
            <input
                id={`${label}Picker`}
                style={{ display: 'none' }}
                type="file"
                onChange={onChange}
                ref={ref}
            />
        </div>
    );
});

export default FolderPicker;
