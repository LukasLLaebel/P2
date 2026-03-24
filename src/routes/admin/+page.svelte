<script>
  let username = "";
  let shareName = "";
  let path = "";
  let roles = [];

  async function saveAuth() {
    const res = await fetch("/api/save-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        shares: [
          {
            name: shareName,
            path: path,
            roles: roles,
          },
        ],
      }),
    });

    const data = await res.json();
    console.log(data);

    username = "";
    shareName = "";
    path = "";
    roles = [];
  }
</script>

<form on:submit|preventDefault={saveAuth}>
  <input placeholder="Username" bind:value={username} required />
  <input placeholder="Share Name" bind:value={shareName} required />
  <input placeholder="Path" bind:value={path} />

  <label>
    <input type="checkbox" value="admin" bind:group={roles} />
    admin
  </label>

  <label>
    <input type="checkbox" value="member" bind:group={roles} />
    member
  </label>

  <button>Add User</button>
</form>
