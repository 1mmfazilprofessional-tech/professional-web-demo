import React from 'react';

export default function Badge({ children, color = 'primary' }) {
  return <span className={`badge ${color}`}>{children}</span>;
}
