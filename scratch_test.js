const baseUrl = "https://api.misterholistic.com.ar/imagenes/productos/";
const extensions = ["jpg", "png", "webp", "jpeg", "JPG", "PNG", "WEBP"];

async function checkProductImage(id) {
  const promises = extensions.map(async (ext) => {
    const imageUrl = `${baseUrl}${id}.${ext}`;
    try {
      const res = await fetch(imageUrl, { method: "HEAD" });
      if (res.ok) {
        return imageUrl;
      }
    } catch (e) {
      // ignore
    }
    return null;
  });
  const results = await Promise.all(promises);
  return results.find(url => url !== null);
}

async function run() {
  console.log("Checking products 215-280 in parallel on new base URL...");
  const ids = Array.from({ length: 66 }, (_, i) => 215 + i);
  
  const checks = ids.map(async (id) => {
    const url = await checkProductImage(id);
    if (url) {
      console.log(`Found: ID ${id} -> ${url}`);
    }
  });

  await Promise.all(checks);
  console.log("Check complete.");
}

run();
