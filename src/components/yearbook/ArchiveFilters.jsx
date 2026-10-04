import React from 'react';

export default function ArchiveFilters({ writer, recipient, writers, recipients, onWriterChange, onRecipientChange, disabled }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
    <label className="flex min-w-0 flex-col gap-2 text-sm text-muted-foreground">
      Written by
      <select value={writer} onChange={event => onWriterChange(event.target.value)} disabled={disabled} className="w-full min-w-0 rounded-xl border border-border bg-card text-foreground px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
        <option value="all">All writers</option>
        {writers.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <label className="flex min-w-0 flex-col gap-2 text-sm text-muted-foreground">
      Written for
      <select value={recipient} onChange={event => onRecipientChange(event.target.value)} disabled={disabled} className="w-full min-w-0 rounded-xl border border-border bg-card text-foreground px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
        <option value="all">All recipients</option>
        {recipients.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  </div>;
}