import app from "../src/index";

const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`Application started on port ${port}`);
});
