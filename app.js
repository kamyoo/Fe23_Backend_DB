//in dev run nodemon with for instant reload
//add requiered library 
//const express =  require('express'); //must be installed with npm
import express from "express";
//const ejs = require('ejs'); //must be installed with npm
import ejs from "ejs";
//const db = require('./db.js'); // Import the database module
import * as db from "./db.js"
//const bodyParser = require('body-parser');//must be installed with npm
import bodyParser from "body-parser";


//create variable representing express
const app = express();

//set public folder for static web pages
app.use("/public", express.static('public'));

//set dynamic web pages, set views and engine
app.set('view engine', 'ejs');

// Set up body parser middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
// Use body-parser middleware to send JSON data
app.use(bodyParser.json());

////////////////Routing

app.get('/', async (req, res) => {
    //res.send("hello World");//serves index.html
    const pageTitle = "Kamys course DB";
    const sql = 'SHOW tables';
    const dbData = await db.query(sql);
    const students = await db.getAllStudents();
    const courses = await db.getAllCourses();
    console.log(dbData);
    res.render('index', { pageTitle, dbData, students, courses: courses });
});

app.get('/getStudents', async (req, res) => {
    try {
        const pageTitle = "Kamys course DB";
        const students = await db.getAllStudents();
        const courses = await db.getAllCourses();
        const dbData = [];
        res.render('getStudents', { pageTitle, dbData, students, courses });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getCourses', async (req, res) => {
    try {
        const pageTitle = "Kamys course DB";
        const courses = await db.getAllCourses();
        const students = await db.getAllStudents(); // Fetch students data as well
        const dbData = [];
        console.log(courses); // Log the courses data
        res.render('getCourses', { pageTitle, dbData, students, courses }); // Pass students data along with courses
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getStudents_courses', async (req, res) => {
    // Fetch data from the students_courses table
    const sql = `SELECT * FROM students_courses`;
    const studentsCourses = await db.query(sql);
    res.json(studentsCourses);
});

let currentTable;
app.post('/', async (req, res) => {

    console.log(req.body);
    const tableName = req.body;
    const pageTitle = "Kamys course DB";
    const sql = `SELECT * FROM ${tableName.table_name}`;
    currentTable = tableName.table_name
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('index', {pageTitle, dbData} );
});



app.get('/removeData', async (req, res) => {
    
    const pageTitle = "Kamys course DB";
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('removeData', {pageTitle, dbData} );
});
app.post('/removeData', async (req, res) => {

    console.log(req.body);
    const requestData = req.body;
    const pageTitle = "Kamys course DB";
    //execute delete query on a table.row
    const sqlDeleteQuery = `DELETE FROM ${currentTable} WHERE id=${requestData.id}`;
    const deleteQuery = await db.query(sqlDeleteQuery);
    console.log(deleteQuery);
    //get table data
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    //get table headers
    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    console.log(dbDataHeaders);
    //show webpage to the user
    res.render('removeData', {pageTitle, dbData, dbDataHeaders} );
});

app.get('/dropdownPage', async (req, res) => {
    try {
        const students = await db.getAllStudents();
        const courses = await db.getAllCourses();
        res.render('dropdownPage', { students, courses });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/getStudents', async (req, res) => {
    const { course_id } = req.body;
    console.log(req.body);
    const sql = `
        SELECT students.*
        FROM students
        INNER JOIN students_courses ON students.id = students_courses.students_id
        WHERE students_courses.courses_id = ?
    `;
    
    const dbData = await db.query(sql, [course_id]);
    console.log(dbData);
    res.render('getStudents', { students: dbData });
});

//server configuration
const port = 3000;
app.listen(port, () => {
    console.log(`server is running on  http://localhost:${port}/`);
});