import React, { forwardRef, ChangeEvent, Ref, FC } from 'react';

interface FolderPickerProps {
    label: string;
    path: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const FolderPicker = forwardRef<HTMLInputElement, FolderPickerProps>((props, ref) => {

    const { label, path, onChange } = props;

    return (
        <div className="flex justify-between w-full gap-2 p-2">
            <div className='items-center w-[30%]'>{`${label}`}</div>
            <div className='text-black bg-gray-700 w-[70%] rounded-lg'> {path} </div>
            <label
                htmlFor={`${label}Picker`}
                className="w-[100px] text-center rounded-lg cursor-pointer bg-gray-500 text-white py-2 px-4"
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
