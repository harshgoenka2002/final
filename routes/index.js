var express = require('express');
var router = express.Router();
var branch=require("./branches")
var userModel=require("./users")
var students=require("./students")
var subjects=require("./subjects");
const departments = require('./departments');
const faculties = require('./faculties');
const { register } = require('module');
const PDF=require("./pdf")
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');



/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/attendance', async function(req, res, next) {
  try{
   var dep=await departments.find({})
   var brnch=await branch.find({})
   var sub=await subjects.find({})
   var fac=await faculties.find({})
   var stu=await students.find({})
  }catch(err){
   console.log(err)
  }
  res.render('attendance',{dep,brnch,sub,fac,stu});
});
router.get('/circular', function(req, res, next) {
  res.render('circular');
});
router.get('/courses-and-materials', async function(req, res, next) {
  var sub=await subjects.find({})
  res.render('courses',{sub});
});
router.get('/event-calendar', function(req, res, next) {
  res.render('eventcal');
});
router.get('/time-table', function(req, res, next) {
  res.render('timetable');
})

// Routes
router.get('/attendance-login', (req, res) => {

  res.render("login",{error:""})
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find user by username and password
    const user = await userModel.findOne({ username, password });
    if (user) {
      // Credentials are correct
      res.redirect('/attendance');
    } else {
      // Credentials are incorrect
      res.render('login', { error: 'Invalid username or password.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/logout', (req, res) => {
  // Redirect to the home page after logout
  res.redirect('/');
});
 


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload PDF file
router.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded.');
        }

        const buffer = req.file.buffer; // File buffer
        const pdfData = await pdfParse(buffer); // Parse PDF

        const subject_id = req.body.subject; // Get subject name from request
       
        const syllabusChecked = req.body.syllabus === 'on';
        const previousYearChecked = req.body.previous_year === 'on';
        const materialsChecked = req.body.materials === 'on';

        const newPDF = new PDF({
            name: req.file.originalname, // PDF file name
            data: buffer, // PDF file buffer
            subject: subject_id, // Subject ID
            checkboxes: { syllabus: syllabusChecked, previous_year: previousYearChecked, materials: materialsChecked } // Checkboxes
        });

        await newPDF.save(); // Save PDF document to database
        res.send('File uploaded successfully.');
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).send('Error uploading file.');
    }
});


// Route to fetch PDFs based on subject and checkboxes
router.get('/pdfs', async (req, res) => {
  try {
    // Extract subject and checkbox values from request query
    const { subject, syllabus, previous_year, materials } = req.query;

    // Build the filter object based on the selected criteria
    const filter = { subject };
    if (syllabus === 'true') filter['checkboxes.syllabus'] = true;
    if (previous_year === 'true') filter['checkboxes.previous_year'] = true;
    if (materials === 'true') filter['checkboxes.materials'] = true;

    // Query the PDF collection using the filter
    const pdfs = await PDF.find(filter);

    // Send the PDF data as a response
    res.json(pdfs);
  } catch (err) {
    console.error('Error fetching PDFs:', err);
    res.status(500).send('Error fetching PDFs.');
  }
});


router.get('/pdf/:id', async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf.data);
  } catch (err) {
    console.error(err);
    res.status(404).send('PDF not found.');
  }
});

//  ****   add branches data    ******
// router.get("/data",async function (req,res){
//   try{
 
//        let c=await branches.insertMany([
//         {
//            branch:"B.TECH 1/4 IT"
//         },{
//            branch:"B.TECH 2/4 IT"
// }
//       ]);
//        res.send(c);
//        console.log("sent")
//       }catch(e){
//         res.send("there is err"+e)
//       }
//     })


//   ****   add departments data   ******
// router.get("/data",async function (req,res){
//   try{
 
//        let c=await departments.insertMany([
//         {
//           department:"Information Technology and Computer Applications"
//         }
//       ]);
//        res.send(c);
//        console.log("sent")
//       }catch(e){
//         res.send("there is err"+e)
//       }
//     })


// ******       add faculties data     *****

// router.get("/data",async function (req,res){
//   try{
//     const cse = await departments.findOne({ department: "Computer Science" });
//     const it = await departments.findOne({ department: "Information Technology" });
//        let c=await faculties.insertMany(
//         [
//   {
//     name:"Prof.Kunjam Nageswara Rao",
//     department:it._id
//     },
//     name:"Dr.S.Jhansi Rani",
//     department:cse._id
//     },
//     {
//     name:"Dr.A.Mary Sowjanya",
//     department:cse._id
//     },
//     {
//     name:"Prof.M.Sashi",
//     department:cse._id
//     },
//     {
//     name:"Prof.V.Valli Kumari",
//     department:cse._id
//     },
//     {
//     name:"Prof.S.Viziananda Row",
//     department:cse._id
//     } ]);
//        res.send(c);
//        console.log("sent")
//       }catch(e){
//         res.send("there is err"+e)
//       }
//     })


// *****  add subjects data  ******
// router.get("/data",async function (req,res){
//   try{
 
//        let c=await subjects.insertMany([
//         {
//           subject:"Operating Systems"
//         },
//         {
//           subject:"Machine Learning"
//         },
//         {
//          subject:"Artificial Intelligence"
//         }]);
//        res.send(c);
//        console.log("sent")
//       }catch(e){
//         res.send("there is err"+e)
//       }
//     })
// // })


// *****    add admin data    ******
// router.get("/data",async function (req,res){
//   try{
 
//        let c=await userModel.insertMany([
//         {
//             username:"admin",
//             password:"admin"
//         }
//       ] );
//        res.send(c);
//        console.log("sent")
//       }catch(e){
//         res.send("there is err"+e)
//       }
//     })
// })


//  ****     add students data     ******
// router.get("/data",async function(req,res){
//   try{

//     const it =  await departments.findOne({ department: "Information Technology" });
//     const cse =  await departments.findOne({ department: "Computer Science" });
//     const fourbyfourIT = await branch.findOne({ branch: "B.TECH 4/4 IT" });
//     const onebyfourIT = await branch.findOne({ branch: "B.TECH 1/4 IT" });
//     const twobyfourIT = await branch.findOne({ branch: "B.TECH 2/4 IT" });
//     const threebyfourIT = await branch.findOne({ branch: "B.TECH 3/4 IT" });
//     const onebytwoMTECH = await branch.findOne({ branch: "M.TECH 1/2 IT" });
//     const twobytwoMTECH = await branch.findOne({ branch: "M.TECH 2/2 IT" });
//     const onebytwoMSC = await branch.findOne({ branch: "MSC 1/2 IT" });
//     const twobytwoMSC = await branch.findOne({ branch: "MSC 2/2 IT" });
//     const onebytwoMCA = await branch.findOne({ branch: "MCA 1/2 IT" });
//     const twobytwoMCA = await branch.findOne({ branch: "MCA 2/2 IT" });
//     let c=await students.insertMany([
//       {
//         name: "Anu",
//         rollno: 423206421001,
//         department: it._id,
//         branch: twobytwoMSC._id
//     },
//     {
//         name: "Aarav",
//         rollno: 423206421002,
//         department: it._id,
//         branch: twobytwoMSC._id
//     },
//     {
//         name: "Aanya",
//         rollno: 423206421003,
//         department: it._id,
//         branch: twobytwoMSC._id
//     },
    
//     {
//       name: "Aadi",
//       rollno: 323207360001,
//       department: it._id,
//       branch: twobytwoMCA._id
//   },
//   {
//       name: "Aadya",
//       rollno: 323207360002,
//       department: it._id,
//       branch: twobytwoMCA._id
//   },
//   {
//     name: "Akash",
//     rollno: 324207311000,
//     department: it._id,
//     branch: onebyfourIT._id
// },
// {
//     name: "Aarav",
//     rollno: 324107311001,
//     department: it._id,
//     branch: onebyfourIT._id
// },
// {
//     name: "Aarushi",
//     rollno: 324107311002,
//     department: it._id,
//     branch: onebyfourIT._id
// }]);
//     res.send(c)
// }catch(e){
//   res.send(e);
// }
// })


module.exports = router;
