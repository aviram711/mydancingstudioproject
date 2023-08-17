const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'mydancingstudio',
});

app.use(express.json());
app.use(cors());

app.post('/api/register', (req, res) => {
  const formData = req.body;
  formData.birthdate = new Date(formData.birthdate);

  const sql = 'INSERT INTO register (phoneNumber, parentNames, username, password, cpassword, email, numberOfChildren) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [formData.phoneNumber, formData.parentNames, formData.username, formData.password, formData.cpassword, formData.email, formData.numberOfChildren];

  connection.query(sql, values, (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Error saving form data' });
    } else {
      const children = formData.children.map(child => {
        return [child.childName, child.birthdate, child.gender, child.courseType, formData.phoneNumber, child.childID];
      });

      if (children.length > 0) {
        const sql2 = 'INSERT INTO children (childName, birthdate, gender, courseType, phoneNumber, childID) VALUES ?';
        connection.query(sql2, [children], (error) => {
          if (error) {
            console.error(error);
            res.status(500).json({ message: 'Error saving children data' }); 
          } else {
            // Insert the courses after saving children
            const courses = formData.children.map(child => {
              return [child.courseType, child.childID];
            });

            const sql3 = 'INSERT INTO courses (courseType, childID) VALUES ?';
            connection.query(sql3, [courses], (error) => {
              if (error) {
                console.error(error);
                res.status(500).json({ message: 'Error saving course data' });
              } else {
                res.json({ message: 'Form data received and saved successfully!' }); 
              }
            });
          }
        });
      } else {
        res.json({ message: 'Form data received and saved successfully!' });
      }
    }
  });
});


app.post('/api/login', (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const password = req.body.password;

  const sql = 'SELECT * FROM register WHERE phoneNumber = ? AND password = ?';
  const values = [phoneNumber, password];

  connection.query(sql, values, (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Error logging in' });
    } else {
      if (result.length > 0) {
        res.json({ message: 'Login successful!' });
      } else {
        res.status(401).json({ message: 'Invalid phoneNumber or password' });
      }
    }
  });
});

app.get('/api/customers', (req, res) => {
  const query = `
    SELECT register.parentNames, register.username, register.password, register.email, register.numberOfChildren, children.birthdate, children.gender, 
    register.phoneNumber, children.childName, children.courseType, children.childID
    FROM register
    JOIN children ON register.phoneNumber = children.phoneNumber
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving customer data' });
    } else {
      res.json(results);
    }
  });
});


app.post('/api/customers/:phoneNumber', (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  const updatedCustomerData = req.body; // Contains the updated customer details

  // Perform the necessary database update operation using the received data
  const registerSql = 'UPDATE register SET parentNames = ?, phoneNumber = ?, username = ?, password = ?, email = ?, numberOfChildren = ? WHERE phoneNumber = ?';
  const registerValues = [
    updatedCustomerData.parentNames,
    updatedCustomerData.phoneNumber,
    updatedCustomerData.username,
    updatedCustomerData.password,
    updatedCustomerData.email,
    updatedCustomerData.numberOfChildren,
    phoneNumber
  ];

  const childrenSql = 'UPDATE children SET childName = ?, birthdate = ?, courseType = ? WHERE phoneNumber = ?';
  const childrenValues = [
    updatedCustomerData.childName,
    updatedCustomerData.birthdate,
    updatedCustomerData.courseType,
    updatedCustomerData.phoneNumber
  ];

  connection.query(registerSql, registerValues, (registerError, registerResult) => {
    if (registerError) {
      console.error(registerError);
      res.status(500).json({ message: 'Error updating customer details' });
    } else {
      connection.query(childrenSql, childrenValues, (childrenError, childrenResult) => {
        if (childrenError) {
          console.error(childrenError);
          res.status(500).json({ message: 'Error updating children details' });
        } else {
          res.json({ message: 'Customer details updated successfully!' });
        }
      });
    }
  });
});



app.delete('/api/customers/:phoneNumber/:childID', (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  const childID = req.params.childID;

  const deleteChildSql = 'DELETE FROM children WHERE phoneNumber = ? AND childID = ?';
  const deleteParentSql = 'DELETE FROM register WHERE phoneNumber = ?';

  connection.query(deleteChildSql, [phoneNumber, childID], (childError, childResult) => {
    if (childError) {
      console.error(childError);
      res.status(500).json({ message: 'Error deleting child details' });
    } else {
      console.log(childResult);

      // Check if the parent has any remaining children
      const remainingChildrenSql = 'SELECT COUNT(*) AS childCount FROM children WHERE phoneNumber = ?';
      connection.query(remainingChildrenSql, [phoneNumber], (remainingChildrenError, remainingChildrenResult) => {
        if (remainingChildrenError) {
          console.error(remainingChildrenError);
          res.status(500).json({ message: 'Error checking remaining children' });
        } else {
          const childCount = remainingChildrenResult[0].childCount;
          if (childCount === 0) {
            // If no remaining children, delete the parent as well
            connection.query(deleteParentSql, [phoneNumber], (parentError, parentResult) => {
              if (parentError) {
                console.error(parentError);
                res.status(500).json({ message: 'Error deleting parent details' });
              } else {
                console.log(parentResult);
                res.json({ message: 'Child and parent deleted successfully!' });
              }
            });
          } else {
            res.json({ message: 'Child deleted successfully!' });
          }
        }
      });
    }
  });
});


app.get('/api/courses', (req, res) => {
  const sql = `
    SELECT courses.*, course_schedule.dayOfWeek, course_schedule.startTime, course_schedule.endTime
    FROM courses
    LEFT JOIN course_schedule ON courses.id = course_schedule.courseID`;
  connection.query(sql, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving course types' });
    } else {
      res.json(results);
    }
  });
});
app.post('/api/courses/saveChanges', (req, res) => {
  console.log('Data received:', req.body);
  const { course, schedules } = req.body;

  const updateCourseSql = `
      UPDATE courses
      SET courseType = ?, teachers = ?
      WHERE id = ?`;

  connection.query(updateCourseSql, [course.courseType, course.teachers, course.id], (error) => {
      if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Error updating course' });
      }

      // Delete existing schedules for the course
      const deleteScheduleSql = 'DELETE FROM course_schedule WHERE courseID = ?';
      connection.query(deleteScheduleSql, [course.id], (error) => {
          if (error) {
              console.error(error);
              return res.status(500).json({ message: 'Error deleting old schedule' });
          }

          // Insert new schedules using Promises
          const insertPromises = schedules.map(schedule => {
              return new Promise((resolve, reject) => {
                  const insertScheduleSql = `
                      INSERT INTO course_schedule (courseID, dayOfWeek, startTime, endTime)
                      VALUES (?, ?, ?, ?)`;
                  
                  connection.query(insertScheduleSql, [course.id, schedule.dayOfWeek, schedule.startTime, schedule.endTime], (error) => {
                      if (error) {
                          reject(error);
                      } else {
                          resolve();
                      }
                  });
              });
          });

          Promise.all(insertPromises)
          .then(() => {
              res.json({ success: true, message: 'Changes saved successfully' });
          })
          .catch(error => {
              console.error(error);
              res.status(500).json({ message: 'Error inserting new schedule' });
          });
      });
  });
});


app.delete('/api/courses/deleteDay', (req, res) => {
  const { courseId, dayOfWeek } = req.body;

  // SQL query to delete the specified day for the given course
  const deleteDaySql = `
    DELETE FROM course_schedule 
    WHERE courseID = ? AND dayOfWeek = ?`;

  connection.query(deleteDaySql, [courseId, dayOfWeek], (error) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting the specified day' });
    } else {
      res.json({ success: true, message: 'Day deleted successfully' });
    }
  });
});







connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});