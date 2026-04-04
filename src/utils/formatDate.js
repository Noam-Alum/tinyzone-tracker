export default function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString();
}
