import React from 'react';

interface Props {
    value: string;
    onChange: (val: string) => void;
    isEditing: boolean;
    className?: string;
    multiline?: boolean;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export const EditableText: React.FC<Props> = ({
    value,
    onChange,
    isEditing,
    className = '',
    multiline = false,
    tag: Tag = 'span'
}) => {
    if (isEditing) {
        if (multiline) {
            return (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`input-field min-h-[100px] bg-white/10 ${className}`}
                />
            );
        }
        return (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`input-field bg-white/10 ${className}`}
            />
        );
    }
    return <Tag className={className}>{value}</Tag>;
};
