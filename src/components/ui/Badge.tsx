import type { CaseStatus, CaseSeverity } from '../../types';

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    children: React.ReactNode;
    className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
    const variants = {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-sky-100 text-sky-700',
    };

    return (
        <span
            className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-medium rounded-full
        ${variants[variant]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}

// Status-specific badge
interface StatusBadgeProps {
    status: CaseStatus;
    className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const statusConfig = {
        Open: { variant: 'danger' as const, label: 'Open' },
        Pending: { variant: 'warning' as const, label: 'Pending' },
        Closed: { variant: 'success' as const, label: 'Closed' },
    };

    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    );
}

// Severity-specific badge
interface SeverityBadgeProps {
    severity: CaseSeverity;
    className?: string;
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
    const severityConfig = {
        Low: { variant: 'info' as const, label: 'Low' },
        Medium: { variant: 'warning' as const, label: 'Medium' },
        High: { variant: 'danger' as const, label: 'High' },
        Critical: { variant: 'danger' as const, label: 'Critical' },
    };

    const config = severityConfig[severity];

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    );
}
