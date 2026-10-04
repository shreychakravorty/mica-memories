const normalize = value => (value || '').trim().toLowerCase();
export function batchEmails(person) {
  return [...new Set([person.email, ...(person.email_aliases || [])].map(normalize).filter(email => email.split('@')[0].endsWith('11')))];
}
export function contributorIdentity(comment, people) {
  const email = normalize(comment.author_email);
  // Other cohorts must never be matched by a similar or identical name.
  const isBatchLogin = email.split('@')[0].endsWith('11');
  const person = isBatchLogin ? people.find(p => batchEmails(p).includes(email)) || people.find(p => normalize(p.name) === normalize(comment.author_name)) : null;
  return { person, name: person ? person.name : comment.author_email };
}