// Interactive form handling

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const name = document.getElementById("productName").value
  const price = document.getElementById("productPrice").value
  const resultDiv = document.getElementById("result")

  try {
    const response = await fetch("/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, price }),
    })

    const result = await response.json()

    resultDiv.style.display = "block"
    resultDiv.innerHTML = `
            <strong>Response (${response.status}):</strong><br>
            <pre>${JSON.stringify(result, null, 2)}</pre>
        `

    // Reset form
    document.getElementById("productForm").reset()
  } catch (error) {
    resultDiv.style.display = "block"
    resultDiv.innerHTML = `
            <strong>Error:</strong><br>
            <pre>${error.message}</pre>
        `
  }
})
