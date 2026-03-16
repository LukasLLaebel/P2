export async function load() {
  const res = await fetch('/api/hello');
  const data = await res.json();
  return { data };
}
