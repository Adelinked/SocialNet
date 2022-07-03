export function displayDate(date) {
  const d = new Date(date);
  const now = new Date();

  const days = Math.floor((now - d) / (1000 * 3600 * 24));
  if (days >= 10) return String(d).slice(3, 15);
  if (days > 1) return String(days) + " days ago";
  if (days == 1) return "yesterday";
  const hours = Math.floor((now - d) / (1000 * 3600));
  if (hours < 24 && hours > 1) return String(hours) + " hours ago";
  if (hours == 1) return " one hour ago";
  const minutes = Math.floor((now - d) / (1000 * 60));
  if (minutes < 60 && minutes > 1) return String(minutes) + " minutes ago";
  if (minutes == 1) return " one minute ago";

  const seconds = Math.floor((now - d) / 1000);
  if (seconds < 60 && seconds >= 1) return String(seconds) + " seconds ago";
  else return "just now";
}
