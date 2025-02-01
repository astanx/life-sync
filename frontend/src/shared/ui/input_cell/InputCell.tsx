import React, { forwardRef, InputHTMLAttributes } from 'react';
import classes from './InputCell.module.css';

type InputCellProps = {
  index: number;
  onCustomChange: (value: string, index: number) => void; 
} & InputHTMLAttributes<HTMLInputElement>

const InputCell = forwardRef<HTMLInputElement, InputCellProps>(
  ({ onCustomChange, index, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      onCustomChange(value, index); 
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <input
        ref={ref}
        className={classes.inputCell}
        maxLength={1}
        onChange={handleChange}
        {...props} 
        autoComplete="off"
      />
    );
  }
);

export { InputCell };