const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // เพิ่ม bcrypt สำหรับการจัดการรหัสผ่านอย่างปลอดภัย
const app = express();
const port = 3000;

// สร้างการเชื่อมต่อกับฐานข้อมูล
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "shopdee"
});

db.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// เพิ่มการใช้งาน parameterized queries และ bcrypt

app.post('/product', function (req, res) {
    const { productName, productDetail, price, cost, quantity } = req.body;
    
    // ใช้ parameterized queries เพื่อป้องกัน SQL Injection
    let sql = "INSERT INTO product (productName, productDetail, price, cost, quantity) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [productName, productDetail, price, cost, quantity], function (err, result) {
        if (err) {
            console.error(err); // ไม่ควรส่ง error details ไปให้ผู้ใช้
            return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'status': false });
        }
        res.send({ 'message': 'บันทึกข้อมูลสำเร็จ', 'status': true });
    });
});

app.get('/product/:id', function (req, res) {
    const productID = req.params.id;

    // ใช้ parameterized queries เพื่อป้องกัน SQL Injection
    let sql = "SELECT * FROM product WHERE productID = ?";
    db.query(sql, [productID], function (err, result) {
        if (err) {
            console.error(err); // ไม่ควรส่ง error details ไปให้ผู้ใช้
            return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการดึงข้อมูล', 'status': false });
        }
        res.send(result);
    });
});

app.post('/login', function (req, res) {
    const { username, password } = req.body;

    // ใช้ parameterized queries เพื่อป้องกัน SQL Injection
    let sql = "SELECT * FROM customer WHERE username = ? AND isActive = 1";
    db.query(sql, [username], function (err, result) {
        if (err) {
            console.error(err); // ไม่ควรส่ง error details ไปให้ผู้ใช้
            return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'status': false });
        }
        
        if (result.length > 0) {
            let customer = result[0];

            // ตรวจสอบรหัสผ่านที่เข้ารหัสโดยใช้ bcrypt
            bcrypt.compare(password, customer.password, function (err, isMatch) {
                if (err) {
                    console.error(err);
                    return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน', 'status': false });
                }

                if (isMatch) {
                    customer['message'] = "เข้าสู่ระบบสำเร็จ";
                    customer['status'] = true;
                    res.send(customer);
                } else {
                    res.send({ "message": "กรุณาระบุรหัสผ่านใหม่อีกครั้ง", "status": false });
                }
            });
        } else {
            res.send({ "message": "ผู้ใช้งานนี้ไม่มีอยู่ในระบบ", "status": false });
        }
    });
});

app.listen(port, function () {
    console.log(`Server listening on port ${port}`);
});