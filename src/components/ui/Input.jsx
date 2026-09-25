import React from 'react';

export default function Input({
  value,
  onChange,
  placeholder = '',
  className = '',
  ...props
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`input ${className}`}
      aria-label={props['aria-label'] || placeholder}
      {...props}
    />
  );
}
