import { useMemo, useState } from 'react';
import { contributorIdentity } from '@/components/yearbook/contributorIdentity';

export default function useArchiveFilters(comments, people) {
  const [writer, setWriter] = useState('all');
  const [recipient, setRecipient] = useState('all');
  const indexed = useMemo(() => {
    const writers = new Map();
    const recipients = new Map();
    const notes = comments.map(comment => {
      const identity = contributorIdentity(comment, people);
      const writerKey = identity.person ? `person:${identity.person.id}` : `email:${(comment.author_email || '').trim().toLowerCase()}`;
      const recipientKey = `recipient:${comment.recipient_name}`;
      writers.set(writerKey, { value: writerKey, label: identity.name || 'Unknown contributor' });
      recipients.set(recipientKey, { value: recipientKey, label: comment.recipient_name });
      return { comment, writerKey, recipientKey };
    });
    const alphabetical = values => [...values].sort((a, b) => a.label.localeCompare(b.label));
    return { notes, writers: alphabetical(writers.values()), recipients: alphabetical(recipients.values()) };
  }, [comments, people]);
  const filtered = useMemo(() => indexed.notes
    .filter(note => (writer === 'all' || note.writerKey === writer) && (recipient === 'all' || note.recipientKey === recipient))
    .map(note => note.comment), [indexed, writer, recipient]);
  return { writer, recipient, setWriter, setRecipient, writers: indexed.writers, recipients: indexed.recipients, filtered };
}