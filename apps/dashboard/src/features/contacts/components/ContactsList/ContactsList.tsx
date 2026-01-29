import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import type { ContactOverview } from '../../types';
import { ContactDetail } from '../ContactDetail/ContactDetail';

interface ContactsListProps {
  data: ContactOverview[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

export function ContactsList({ data, pagination }: ContactsListProps) {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const columns: ColumnDef<ContactOverview>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const firstName = row.original.first_name || '';
        const lastName = row.original.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'N/A';
        return <span className="font-medium">{fullName}</span>;
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || 'N/A',
    },
    {
      accessorKey: 'segment_name',
      header: 'Segment',
      cell: ({ row }) => row.original.segment_name || 'N/A',
    },
    {
      accessorKey: 'status_name',
      header: 'Status',
      cell: ({ row }) => row.original.status_name || 'N/A',
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => {
        const score = row.original.score;
        return (
          <span
            className={`font-semibold ${
              score >= 80
                ? 'text-green-600'
                : score >= 50
                ? 'text-yellow-600'
                : 'text-gray-600'
            }`}
          >
            {score}
          </span>
        );
      },
    },
    {
      accessorKey: 'last_touchpoint_at',
      header: 'Last Touchpoint',
      cell: ({ row }) => {
        const date = row.original.last_touchpoint_at;
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString();
      },
    },
    {
      accessorKey: 'touchpoint_count',
      header: 'Touchpoints',
      cell: ({ row }) => row.original.touchpoint_count || 0,
    },
    {
      accessorKey: 'response_count',
      header: 'Responses',
      cell: ({ row }) => row.original.response_count || 0,
    },
  ];

  // Create clickable rows
  const handleRowClick = (contact: ContactOverview) => {
    setSelectedContactId(contact.id);
  };

  // Wrap the DataTable to add row click handlers
  // const _dataWithClickHandler = data.map((contact) => ({
  //   ...contact,
  //   onClick: () => handleRowClick(contact),
  // }));

  // Override the columns to add onClick to each row
  const columnsWithClick: ColumnDef<ContactOverview>[] = columns.map((col) => ({
    ...col,
    cell: (info) => {
      const originalCell = typeof col.cell === 'function' ? col.cell(info) : info.getValue();
      return (
        <div
          onClick={() => handleRowClick(info.row.original)}
          className="cursor-pointer"
        >
          {originalCell}
        </div>
      );
    },
  }));

  return (
    <>
      <DataTable
        data={data}
        columns={columnsWithClick}
        pageSize={pagination?.pageSize || 100}
        pagination={pagination}
        emptyState={
          <div className="text-center py-8 text-gray-500">
            No contacts found. Adjust your filters to see more results.
          </div>
        }
      />
      {selectedContactId && (
        <ContactDetail
          contactId={selectedContactId}
          isOpen={!!selectedContactId}
          onClose={() => setSelectedContactId(null)}
        />
      )}
    </>
  );
}
