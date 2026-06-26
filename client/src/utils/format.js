export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(dateStr)).toUpperCase();
};

export const formatDateRelative = (dateStr) => {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return 'À l\'instant';
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD === 1) return 'Hier';
  if (diffD < 7) return `Il y a ${diffD} jours`;
  return formatDate(dateStr);
};
