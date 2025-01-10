import e from "express";
import pg from "pg";
import bodyParser from "body-parser";

const port = 3000;
const app = e();
var users = [];
var countries = [];
var country_codes = [];
var countries2 =[];
var firstColor = "";

const db = new pg.Client({ user: "postgres", database: "world", password: "mB*007!", host: "localhost", port: 5432 });
db.connect();

app.use(bodyParser.urlencoded({extended:true}));
app.use(e.static('public'));

async function getUsers() {
  await db.query("SELECT * FROM users").then((response) => {
    users = response.rows;
  });
  return users;
}
async function getCountries(color) {
  country_codes = [];
  try {
  await db.query("SELECT country_code FROM visited_countries WHERE color = $1 ", [color]).then((response) => {
    countries = response.rows;
  });
  } catch (err) {
    console.error("ha-ha you ain't traveling shit");
  } countries.forEach(element => {
    country_codes.push(element.country_code);
  });
}
async function getColor(name) {
  await db.query("SELECT color FROM users WHERE name = $1", [name]).then((response) => {
    firstColor = response.rows[0].color;
  });
}

app.get("/", async (req, res) => {    
  await getUsers().then(() => {
    res.render("index.ejs", {users: users, countries: country_codes, color: firstColor, total: countries.length});
  })
});

app.post("/add", async (req,res) => {
    try {
    await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",[req.body.country.toLowerCase()]).then((response) => { 
      countries2 = response.rows;
    });       
      try {
        await getUsers().then(async () => { 
          await db.query("INSERT INTO visited_countries(country_code, color) VALUES ($1, $2)", [countries2[0].country_code, firstColor]);
          await getCountries(firstColor).then(() => {
            country_codes.push(countries2[0].country_code);
            res.render("index.ejs", { total :countries.length, countries: country_codes, users: users, color: firstColor});
          });
        });
      } catch (err) {
        console.error("already added this lil bitch");
        res.redirect("/");
      }
  } catch (err) {
    console.error("no existo type shi");
    res.redirect("/");
  }
});

app.post("/user", async (req, res) => {
  console.log(req.body);
  if (req.body.add === 'new') res.render("new.ejs"); else {
  await getUsers().then(async () => {
    await getColor(req.body.user).then(async () => {
      await getCountries(firstColor).then(() => {
        users.forEach(element => {
          if( req.body.user === element.name ) { 
            res.render("index.ejs", {users: users, countries: country_codes, total : countries.length, color: firstColor}); 
          }
      });
      });});
  });
}
});
  

app.post("/new",  async (req,res) => {
  try {
  await db.query("INSERT INTO users (name, color) VALUES($1,$2)",[req.body.name, req.body.color])
  getUsers();
  res.redirect("/"); } catch (err) {console.error(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});



/*

post /new
post /user
post /add
get /
*/
