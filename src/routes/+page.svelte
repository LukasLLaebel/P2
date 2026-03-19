<script>
  const { data } = $props();
</script>

<main>
  <h1>Welcome to Svelte postgres</h1>
  <p>{data?.message ?? "No data loaded from backend."}</p>
</main>
