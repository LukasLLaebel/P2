<script>
  export let data;
</script>

<main>
  <h1>Welcome to Svelte!</h1>
  <p>{data?.message ?? "No data loaded from backend."}</p>
</main>
