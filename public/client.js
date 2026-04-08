async function loadAuth() {
  const res = await fetch("/auth");
  const data = await res.json();

  createTable("users", data.users);
  createTable("roles", data.roles);
  createTable("attributes", data.attibutes);
  createTable("permissions", data.permissions);
  createTable("shares", data.shares);
}

function createTable(title, items) {
  const container = document.getElementById(title);

  const heading = document.createElement("h2");
  heading.textContent = title;
  container.appendChild(heading);

  if (!items || items.length === 0) return;

  const table = document.createElement("table");


  const headers = Object.keys(items[0]);
  const thead = document.createElement("tr");

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    thead.appendChild(th);
  });

  table.appendChild(thead);


  items.forEach(item => {
    const tr = document.createElement("tr");

    headers.forEach(h => {
      const td = document.createElement("td");

      let value = item[h];


      if (typeof value === "object") {
        value = JSON.stringify(value, null, 2);
      }

      td.textContent = value;
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  container.appendChild(table);
}

loadAuth();
