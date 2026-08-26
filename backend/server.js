const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


// ========================================
// TEST BACKEND
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "CareerForge Backend Running"
    });
});


// ========================================
// COURSES
// ========================================

app.get("/api/courses", (req, res) => {

    const sql = `
        SELECT *
        FROM courses
        ORDER BY name
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Courses error:", err);

            return res.status(500).json({
                error: "Failed to fetch courses"
            });
        }

        res.json(results);
    });
});


// ========================================
// ALL COMPANIES
// ========================================

app.get("/api/companies", (req, res) => {

    const sql = `
        SELECT *
        FROM companies
        ORDER BY name
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Companies error:", err);

            return res.status(500).json({
                error: "Failed to fetch companies"
            });
        }

        res.json(results);
    });
});


// ========================================
// COMPANIES FOR SELECTED COURSE
// ========================================

app.get("/api/courses/:courseId/companies", (req, res) => {

    const courseId = req.params.courseId;

    const sql = `
        SELECT c.*
        FROM companies c
        INNER JOIN course_companies cc
            ON c.id = cc.company_id
        WHERE cc.course_id = ?
        ORDER BY c.name
    `;

    db.query(sql, [courseId], (err, results) => {

        if (err) {
            console.error("Course companies error:", err);

            return res.status(500).json({
                error: "Failed to fetch companies for course"
            });
        }

        res.json(results);
    });
});


// ========================================
// COMPANY REQUIREMENTS
// ========================================

app.get("/api/companies/:companyId/requirements", (req, res) => {

    const companyId = req.params.companyId;

    const sql = `
        SELECT *
        FROM company_requirements
        WHERE company_id = ?
    `;

    db.query(sql, [companyId], (err, results) => {

        if (err) {
            console.error("Requirements error:", err);

            return res.status(500).json({
                error: "Failed to fetch company requirements"
            });
        }

        res.json(results);
    });
});


// ========================================
// INTERVIEW QUESTIONS
// ========================================

app.get("/api/interview/questions", (req, res) => {

    const sql = `
        SELECT *
        FROM interview_questions
        ORDER BY id
        LIMIT 10
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Questions error:", err);

            return res.status(500).json({
                error: "Failed to fetch interview questions"
            });
        }

        res.json(results);
    });
});


// ========================================
// SAVE INTERVIEW RESULT
// ========================================

app.post("/api/interview/results", (req, res) => {

    const {
        user_id,
        question,
        user_answer,
        score,
        emotion,
        feedback,
        weak_area
    } = req.body;

    const sql = `
        INSERT INTO interview_results
        (
            user_id,
            question,
            user_answer,
            score,
            emotion,
            feedback,
            weak_area
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            question,
            user_answer,
            score,
            emotion,
            feedback,
            weak_area
        ],
        (err, result) => {

            if (err) {
                console.error("Result save error:", err);

                return res.status(500).json({
                    error: "Failed to save interview result"
                });
            }

            res.json({
                message: "Interview result saved successfully",
                id: result.insertId
            });
        }
    );
});


// ========================================
// GET USER INTERVIEW RESULTS
// ========================================

app.get("/api/users/:userId/results", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT *
        FROM interview_results
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.error("Results error:", err);

            return res.status(500).json({
                error: "Failed to fetch interview results"
            });
        }

        res.json(results);
    });
});


// ========================================
// START SERVER
// ========================================

app.listen(5000, () => {

    console.log("-----------------------------------");
    console.log("CareerForge backend running");
    console.log("Server: http://localhost:5000");
    console.log("-----------------------------------");

});