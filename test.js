import pg from 'pg';
import e from 'express';
import bodyParser from 'body-parser';
import { name } from 'ejs';


const app = e();
var users = [];
var color;
var countries = [];
const db = new pg.Client({ user: "postgres", database: "world", password: "mB*007!", host: "localhost", port: 5432 });
db.connect();


app.use(bodyParser.urlencoded({extended: true}));

async function getUsers() {
  const t1 = await db.query("SELECT * FROM users"); 
  console.log(t1);
  }
async function getCountries(color) {
    countries = (await db.query("SELECT country_code, color FROM visited_countries WHERE color = $1",[color])).rows;
}

 async function getColor(name) { 
    let a = await db.query("SELECT color FROM users WHERE name = $1", [name]);
    color = a.rows[0].color;
  }

getUsers();

app.get("/", (req, res) => { 
  getUsers();           // we need to render with the parameters: color (to fill), users (whole array of all users),                                 // countries (all of the visited countries for all users), and total (amount of countries visited by each person)
  console.log(users);
  
    getColor(users[0].name);
    getCountries(color);
    console.log(color);
    console.log(countries);
    console.log(countries.length);    
    res.render("t1.ejs");
  });

app.listen(3000, () => {
    console.log("listening on port 3000");
    
})
    