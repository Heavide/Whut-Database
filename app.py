from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import cross_origin
import pymysql

app = Flask(__name__)

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234567',
    'database': 'course_management',
    'charset': 'utf8mb4'
}


@app.route('/login', methods=['POST'])
@cross_origin(origins="*", methods=['POST'])
def login():
    data = request.get_json()
    uid = data.get('uid')
    pswd = data.get('pswd')
    op = data.get('op')
    print(uid)
    print(pswd)
    print(op)
    connection = pymysql.connect(**db_config)
    sql = "SELECT COUNT(uid) FROM user WHERE uid=%s and pswd=%s and op=%s"
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(sql, (uid, pswd, op))
            res = cursor.fetchall()
            x = int(res[0]['COUNT(uid)'])
            if x == 1:
                return jsonify({"message": "Login successful!"}), 200
            else:
                return jsonify({"message": "Login failed!"}), 404
    finally:
        connection.close()


@app.route('/getclass', methods=['GET'])
@cross_origin(origins="*", methods=['GET'])
def get_courses():
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT CNo, CName, CInfo FROM class")
            courses = cursor.fetchall()
            return jsonify(courses)
    finally:
        connection.close()


@app.route('/addclass', methods=['POST'])
@cross_origin(origins="*", methods=['POST'])
def add_course():
    data = request.json
    name = data.get('CName')
    description = data.get('CInfo')

    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor() as cursor:
            sql_count = "SELECT MAX(CNo) FROM class"
            cursor.execute(sql_count)
            result = cursor.fetchone()
            num = int(result[0][1:]) + 1
            cid = 'C' + str(num).zfill(3)
            sql = "INSERT INTO class (CNo, CName, CInfo) VALUES (%s, %s, %s)"
            cursor.execute(sql, (cid, name, description))
            connection.commit()
        return jsonify({"message": "课程已添加"}), 201
    finally:
        connection.close()


@app.route('/delclass/<course_id>', methods=['DELETE'])
@cross_origin(origins="*", methods=['DELETE'])
def delete_course(course_id):
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor() as cursor:
            sql = "DELETE FROM class WHERE CNo = %s"
            cursor.execute(sql, (course_id,))
            connection.commit()
        return jsonify({"message": "课程已删除"}), 200
    finally:
        connection.close()


@app.route('/editclass', methods=['POST'])
@cross_origin(origins="*", methods=['POST'])
def edit_course():
    data = request.json
    cid = data.get('CNo')
    name = data.get('CName')
    description = data.get('CInfo')
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor() as cursor:
            sql = "UPDATE class SET CName=%s, CInfo=%s WHERE CNo=%s"
            cursor.execute(sql, (name, description, cid))
            connection.commit()
        return jsonify({"message": "课程已修改"}), 201
    finally:
        connection.close()


@app.route('/getstaff', methods=['GET'])
@cross_origin(origins="*", methods=['GET'])
def get_staff():
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT SNo, SName, SSex FROM staff")
            employees = cursor.fetchall()
            return jsonify(employees)
    finally:
        connection.close()


@app.route('/getregister', methods=['GET'])
@cross_origin(origins="*", methods=['GET'])
def get_register():
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT RNo,CName,Adr,TM,Cap,Price,Status FROM Register,Class WHERE Register.CNo=Class.CNo")
            registers = cursor.fetchall()
            for i in registers:
                i['TM'] = i['TM'].strftime("%Y-%m-%d %H:%M:%S")
            return jsonify(registers)
    finally:
        connection.close()


@app.route('/editregister', methods=['POST'])
@cross_origin(origins="*", methods=['POST'])
def edit_register():
    data = request.json
    rid = data.get('RNo')
    adr = data.get('Adr')
    tm = data.get('TM')
    cap = int(data.get('Cap'))
    price = float(data.get('Price'))
    st = data.get('Status')
    if st == "未开始":
        st = 0
    else:
        st = 1
    st = int(st)
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor() as cursor:
            sql = "UPDATE register SET Adr=%s,TM=%s,Cap=%s,Price=%s,Status=%s WHERE RNo=%s"
            cursor.execute(sql, (adr, tm, cap, price, st, rid))
            connection.commit()
        return jsonify({"message": "课程已修改"}), 201
    finally:
        connection.close()


@app.route('/addregister', methods=['POST'])
@cross_origin(origins="*", methods=['POST'])
def add_register():
    data = request.json
    cid = data.get('CNo')
    adr = data.get('Adr')
    tm = data.get('TM')
    cap = int(data.get('Cap'))
    price = float(data.get('Price'))
    st = 0

    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor() as cursor:
            sql_count = "SELECT MAX(RNo) FROM register"
            cursor.execute(sql_count)
            result = cursor.fetchone()
            num = int(result[0][1:]) + 1
            rid = 'R' + str(num).zfill(3)
            sql = "INSERT INTO register (RNo, CNo, Adr, TM, Cap, Price, Status) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(sql, (rid, cid, adr, tm, cap, price, st))
            connection.commit()
        return jsonify({"message": "安排已添加"}), 201
    finally:
        connection.close()


@app.route('/delregister/<r_id>', methods=['DELETE'])
@cross_origin(origins="*", methods=['DELETE'])
def delete_register(r_id):
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor() as cursor:
            sql = "DELETE FROM register WHERE RNo = %s"
            cursor.execute(sql, (r_id,))
            connection.commit()
        return jsonify({"message": "安排已删除"}), 200
    finally:
        connection.close()


@app.route('/get-teach-for-class/<r_id>', methods=['GET'])
@cross_origin(origins="*", methods=['GET'])
def get_teach_for_class(r_id):
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT DISTINCT Staff.SNo,SName FROM Register,Staff,Teach WHERE Teach.SNo=Staff.SNo and Teach.RNo=%s", r_id)
            registers = cursor.fetchall()
            return jsonify(registers)
    finally:
        connection.close()


@app.route('/get-learn-for-class/<r_id>', methods=['GET'])
@cross_origin(origins="*", methods=['GET'])
def get_learn_for_class(r_id):
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT DISTINCT representative.RepNo,RepName,RepSex FROM Register,representative,learn WHERE learn.RepNo=representative.RepNo and learn.RNo=%s", r_id)
            registers = cursor.fetchall()
            return jsonify(registers)
    finally:
        connection.close()


@app.route('/addteach', methods=['POST'])
@cross_origin(origins="*", methods=['POST'])
def add_teach():
    data = request.json
    sno_list = data.get('Info')
    rno = data.get('RNo')
    connection = pymysql.connect(**db_config)
    try:
        for item in sno_list:
            print(item)
            sno = item.get('SNo', None)
            if sno is None:
                break
            ck = int(item['checked'])
            with connection.cursor() as cursor:
                if ck == 1:
                    sql = "INSERT INTO teach (SNo, RNo) SELECT %s, %s FROM DUAL WHERE NOT EXISTS (SELECT * FROM teach WHERE SNO=%s and RNO=%s)"
                    cursor.execute(sql, (sno, rno, sno, rno))
                elif ck == 0:
                    sql = "DELETE FROM teach WHERE SNo = %s"
                    cursor.execute(sql, sno)
                connection.commit()
        return jsonify({"message": "安排已添加"}), 201
    finally:
        connection.close()


@app.route('/getSchedule', methods=['GET'])
@cross_origin(origins="*", methods=['GET'])
def get_schedule():
    connection = pymysql.connect(**db_config)
    role = request.args.get('role')
    qid = request.args.get('employeeId')
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            if role == 'employee':
                sql_count = "SELECT Count(SNo) FROM staff WHERE SNo=%s"
                cursor.execute(sql_count, qid)
                result = cursor.fetchone()
                f = int(result['Count(SNo)'])
                if f == 0:
                    return jsonify({"message": "该员工不存在"}), 404
                cursor.execute("SELECT * FROM Teach,Register,Class WHERE Teach.SNo=%s and Teach.RNo=Register.RNo and Register.CNo=Class.CNo", qid)
            else:
                sql_count = "SELECT Count(RepNo) FROM representative WHERE RepNo=%s"
                cursor.execute(sql_count, qid)
                result = cursor.fetchone()
                f = int(result['Count(RepNo)'])
                if f == 0:
                    return jsonify({"message": "该代表不存在"}), 404
                cursor.execute("SELECT * FROM Learn,Register,Class WHERE Learn.RepNo=%s and Learn.RNo=Register.RNo and Register.CNo=Class.CNo", qid)
            schedules = cursor.fetchall()
            for i in schedules:
                i['TM'] = i['TM'].strftime("%Y-%m-%d %H:%M:%S")
            return jsonify(schedules)

    finally:
        connection.close()


@app.route('/getcompany', methods=['GET'])
@cross_origin(origins="*", methods=['GET'])
def get_company():
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM company")
            registers = cursor.fetchall()
            return jsonify(registers)
    finally:
        connection.close()


@app.route('/getRepresentatives', methods=['GET'])
@cross_origin(origins="*", methods=['GET'])
def get_rep():
    connection = pymysql.connect(**db_config)
    cpid = request.args.get('companyId')
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            if cpid is None:
                cursor.execute("SELECT * FROM representative")
            else:
                cursor.execute("SELECT * FROM representative WHERE CpNo=%s", cpid)
            schedules = cursor.fetchall()
            return jsonify(schedules)
    finally:
        connection.close()


@app.route('/getprice', methods=['GET'])
@cross_origin(origins="*", methods=['GET'])
def get_price():
    connection = pymysql.connect(**db_config)
    rno = request.args.get('RNo')
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT Price FROM register WHERE RNo = %s", rno)
            registers = cursor.fetchall()
            return jsonify(registers)
    finally:
        connection.close()


@app.route('/addenroll', methods=['POST'])
@cross_origin(origins="*", methods=['POST'])
def add_enroll():
    data = request.json
    rno = data.get('RNo')
    cpno = data.get('CpNo')
    rep_list = data.get('Rep')
    cnt = len(rep_list)
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor() as cursor:
            for i in rep_list:
                sql = "INSERT INTO learn (RepNo, RNo) SELECT %s, %s FROM DUAL WHERE NOT EXISTS (SELECT * FROM learn WHERE RepNO=%s and RNO=%s)"
                cursor.execute(sql, (i, rno, i, rno))
            cursor.execute("SELECT Price FROM register WHERE RNo = %s", rno)
            price = cursor.fetchone()
            price = float(price[0]) * cnt
            sql = "INSERT INTO enroll (RNo, CpNo, Price, Cnt) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (rno, cpno, price, cnt))
            connection.commit()
        return jsonify({"message": "安排已添加"}), 201
    finally:
        connection.close()


@app.route('/getenroll', methods=['GET'])
@cross_origin(origins="*", methods=['GET'])
def get_enroll():
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT DISTINCT * FROM class,enroll,company,register WHERE enroll.CpNo=company.CpNo and enroll.RNo=register.RNo and register.CNo=class.CNo")
            registers = cursor.fetchall()
            return jsonify(registers)
    finally:
        connection.close()


@app.route('/deleteSchedule', methods=['POST'])
@cross_origin(origins="*", methods=['POST'])
def delete_schedule():
    connection = pymysql.connect(**db_config)
    data = request.json
    id = data.get('id')
    rno = data.get('idx')
    try:
        with connection.cursor() as cursor:
            if id[0] == 'S':
                sql = "DELETE FROM teach WHERE SNo = %s and RNo = %s"
                cursor.execute(sql, (id, rno))
            elif id[0] == 'R':
                sql = "DELETE FROM learn WHERE RepNo = %s and RNo = %s"
                cursor.execute(sql, (id, rno))
            connection.commit()
        return jsonify({"message": "课表已删除"}), 200
    finally:
        connection.close()


if __name__ == '__main__':
    app.run(debug=True)
