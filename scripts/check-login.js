async function main() {
  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "client@fitflow.io", password: "ChangeMe123!" }),
  });
  const text = await res.text();
  console.log({ status: res.status, body: text });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
