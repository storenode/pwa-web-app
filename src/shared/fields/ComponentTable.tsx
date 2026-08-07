import type { ReactNode } from "react";

// Props for Table
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
}

// Props for TableHeader
interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
}

// Props for TableBody
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
}

// Props for TableRow
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
}

// Props for TableCell
interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode; // Cell content
  isHeader?: boolean; // If true, renders as <th>, otherwise <td>
  className?: string; // Optional className for styling
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full  ${className}`}>{children}</table>;
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
// Alternates row background (odd/even) and adds top/bottom borders, both using
// daisyUI's theme-aware base-100/200/300 colors so they adapt to light/dark.
const TableRow: React.FC<TableRowProps> = ({ children, className = "" }) => {
  return (
    <tr
      className={`border-t border-b border-base-300 first:border-t-0 last:border-b-0 odd:bg-base-100 even:bg-base-200 ${className}`}
    >
      {children}
    </tr>
  );
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  ...rest
}) => {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag className={` ${className}`} {...rest}>
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
